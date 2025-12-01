// Re-export all ticket detail components
export { default as TicketHeader } from "./TicketHeader";
export { default as TicketDescription } from "./TicketDescription";
export { default as TicketGeneralInfo } from "./TicketGeneralInfo";

// Type-specific info components
export { default as TicketTypeInfoSection } from "./TicketTypeInfo";
export {
  ConsultaInfo,
  QuejaInfo,
  SolicitudInfo,
  ReclamoInfo,
} from "./TicketTypeInfo";

// Assignment history components
export { default as AssignmentHistorySection } from "./AssignmentHistory";
export {
  AssignmentCard,
  EmployeeDetails,
  DocumentationDetails,
} from "./AssignmentHistory";
