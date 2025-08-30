#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod raffle {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    /// Estructura para almacenar información de la rifa
    #[ink(storage)]
    pub struct Raffle {
        /// Configuración de la plataforma
        platform_authority: AccountId,
        platform_fee_account: AccountId,
        
        /// Mapeo de ID de rifa a información de rifa
        raffles: Mapping<u32, RaffleInfo>,
        
        /// Contador de rifas creadas
        next_raffle_id: u32,
        
        /// Mapeo de rifa_id -> participantes
        raffle_participants: Mapping<u32, Vec<AccountId>>,
    }

    /// Información de una rifa individual
    #[derive(scale::Decode, scale::Encode, Clone, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct RaffleInfo {
        pub organizer: AccountId,
        pub max_tickets: u32,
        pub ticket_price: Balance,
        pub fee_percent: u8,
        pub stake_percent: u8,
        pub tickets_sold: u32,
        pub winner: Option<AccountId>,
        pub is_closed: bool,
        pub total_stake: Balance,
    }

    /// Eventos del contrato
    #[ink(event)]
    pub struct RaffleCreated {
        #[ink(topic)]
        raffle_id: u32,
        #[ink(topic)]
        organizer: AccountId,
        max_tickets: u32,
        ticket_price: Balance,
    }

    #[ink(event)]
    pub struct TicketPurchased {
        #[ink(topic)]
        raffle_id: u32,
        #[ink(topic)]
        buyer: AccountId,
        tickets_sold: u32,
    }

    #[ink(event)]
    pub struct RaffleClosed {
        #[ink(topic)]
        raffle_id: u32,
        #[ink(topic)]
        winner: AccountId,
    }

    /// Errores del contrato
    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum RaffleError {
        InvalidTicketCount,
        InvalidTicketPrice,
        InvalidFeePercent,
        InvalidStakePercent,
        RaffleNotFound,
        RaffleClosed,
        NoTicketsAvailable,
        AlreadyParticipating,
        NotOrganizer,
        NoTicketsSold,
        NotWinner,
        TransferFailed,
    }

    impl Raffle {
        /// Constructor
        #[ink(constructor)]
        pub fn new(platform_authority: AccountId, platform_fee_account: AccountId) -> Self {
            Self {
                platform_authority,
                platform_fee_account,
                raffles: Mapping::default(),
                next_raffle_id: 1,
                raffle_participants: Mapping::default(),
            }
        }

        /// Crear una nueva rifa
        #[ink(message)]
        pub fn create_raffle(
            &mut self,
            max_tickets: u32,
            ticket_price: Balance,
            fee_percent: u8,
            stake_percent: u8,
        ) -> Result<u32, RaffleError> {
            // Validaciones
            if max_tickets == 0 || max_tickets > 10000 {
                return Err(RaffleError::InvalidTicketCount);
            }
            if ticket_price < 1_000_000_000 { // 0.001 DOT mínimo
                return Err(RaffleError::InvalidTicketPrice);
            }
            if fee_percent > 20 {
                return Err(RaffleError::InvalidFeePercent);
            }
            if stake_percent > 50 {
                return Err(RaffleError::InvalidStakePercent);
            }
            if fee_percent + stake_percent > 70 {
                return Err(RaffleError::InvalidFeePercent);
            }

            let raffle_id = self.next_raffle_id;
            let organizer = self.env().caller();

            let raffle_info = RaffleInfo {
                organizer,
                max_tickets,
                ticket_price,
                fee_percent,
                stake_percent,
                tickets_sold: 0,
                winner: None,
                is_closed: false,
                total_stake: 0,
            };

            self.raffles.insert(raffle_id, &raffle_info);
            self.raffle_participants.insert(raffle_id, &Vec::new());
            self.next_raffle_id += 1;

            self.env().emit_event(RaffleCreated {
                raffle_id,
                organizer,
                max_tickets,
                ticket_price,
            });

            Ok(raffle_id)
        }

        /// Comprar un ticket
        #[ink(message, payable)]
        pub fn buy_ticket(&mut self, raffle_id: u32) -> Result<(), RaffleError> {
            let mut raffle = self.raffles.get(raffle_id).ok_or(RaffleError::RaffleNotFound)?;
            
            if raffle.is_closed {
                return Err(RaffleError::RaffleClosed);
            }
            if raffle.tickets_sold >= raffle.max_tickets {
                return Err(RaffleError::NoTicketsAvailable);
            }

            let buyer = self.env().caller();
            let paid_amount = self.env().transferred_value();

            if paid_amount != raffle.ticket_price {
                return Err(RaffleError::InvalidTicketPrice);
            }

            // Verificar que no haya comprado ya
            let mut participants = self.raffle_participants.get(raffle_id).unwrap_or_default();
            if participants.contains(&buyer) {
                return Err(RaffleError::AlreadyParticipating);
            }

            // Agregar participante
            participants.push(buyer);
            raffle.tickets_sold += 1;

            // Calcular distribución
            let fee_amount = (paid_amount * raffle.fee_percent as u128) / 100;
            let stake_amount = (paid_amount * raffle.stake_percent as u128) / 100;
            let organizer_amount = paid_amount - fee_amount - stake_amount;

            // Transferir fee a plataforma
            if fee_amount > 0 {
                if self.env().transfer(self.platform_fee_account, fee_amount).is_err() {
                    return Err(RaffleError::TransferFailed);
                }
            }

            // Transferir al organizador
            if organizer_amount > 0 {
                if self.env().transfer(raffle.organizer, organizer_amount).is_err() {
                    return Err(RaffleError::TransferFailed);
                }
            }

            // Acumular stake
            raffle.total_stake += stake_amount;

            // Actualizar storage
            self.raffles.insert(raffle_id, &raffle);
            self.raffle_participants.insert(raffle_id, &participants);

            self.env().emit_event(TicketPurchased {
                raffle_id,
                buyer,
                tickets_sold: raffle.tickets_sold,
            });

            Ok(())
        }

        /// Cerrar rifa y seleccionar ganador
        #[ink(message)]
        pub fn close_raffle(&mut self, raffle_id: u32) -> Result<(), RaffleError> {
            let mut raffle = self.raffles.get(raffle_id).ok_or(RaffleError::RaffleNotFound)?;
            
            if raffle.organizer != self.env().caller() {
                return Err(RaffleError::NotOrganizer);
            }
            if raffle.is_closed {
                return Err(RaffleError::RaffleClosed);
            }
            if raffle.tickets_sold == 0 {
                return Err(RaffleError::NoTicketsSold);
            }

            let participants = self.raffle_participants.get(raffle_id).unwrap_or_default();
            
            // Generar número aleatorio usando block hash
            let block_hash = self.env().block_timestamp();
            let random_index = (block_hash as usize) % participants.len();
            let winner = participants[random_index];

            raffle.winner = Some(winner);
            raffle.is_closed = true;

            self.raffles.insert(raffle_id, &raffle);

            self.env().emit_event(RaffleClosed {
                raffle_id,
                winner,
            });

            Ok(())
        }

        /// Reclamar premio
        #[ink(message)]
        pub fn claim_prize(&mut self, raffle_id: u32) -> Result<(), RaffleError> {
            let mut raffle = self.raffles.get(raffle_id).ok_or(RaffleError::RaffleNotFound)?;
            
            if !raffle.is_closed {
                return Err(RaffleError::RaffleClosed);
            }
            
            let caller = self.env().caller();
            if raffle.winner != Some(caller) {
                return Err(RaffleError::NotWinner);
            }
            
            let prize_amount = raffle.total_stake;
            if prize_amount == 0 {
                return Ok(());
            }

            raffle.total_stake = 0;
            self.raffles.insert(raffle_id, &raffle);

            if self.env().transfer(caller, prize_amount).is_err() {
                return Err(RaffleError::TransferFailed);
            }

            Ok(())
        }

        /// Obtener información de rifa
        #[ink(message)]
        pub fn get_raffle_info(&self, raffle_id: u32) -> Option<RaffleInfo> {
            self.raffles.get(raffle_id)
        }

        /// Obtener participantes de una rifa
        #[ink(message)]
        pub fn get_participants(&self, raffle_id: u32) -> Vec<AccountId> {
            self.raffle_participants.get(raffle_id).unwrap_or_default()
        }
    }
}
