import React from "react";
import type {
  TicketConsultaDto,
  TicketQuejaDto,
  TicketSolicitudDto,
  TicketReclamoDto,
} from "../../../../../../services/vista360Api";
import ConsultaInfo from "./ConsultaInfo";
import QuejaInfo from "./QuejaInfo";
import SolicitudInfo from "./SolicitudInfo";
import ReclamoInfo from "./ReclamoInfo";

interface TicketTypeInfoSectionProps {
  consultaInfo: TicketConsultaDto | null;
  quejaInfo: TicketQuejaDto | null;
  solicitudInfo: TicketSolicitudDto | null;
  reclamoInfo: TicketReclamoDto | null;
}

/**
 * Componente que renderiza la información específica según el tipo de ticket.
 * Solo se mostrará la información del tipo correspondiente.
 */
const TicketTypeInfoSection: React.FC<TicketTypeInfoSectionProps> = ({
  consultaInfo,
  quejaInfo,
  solicitudInfo,
  reclamoInfo,
}) => {
  return (
    <>
      {consultaInfo && <ConsultaInfo data={consultaInfo} />}
      {quejaInfo && <QuejaInfo data={quejaInfo} />}
      {solicitudInfo && <SolicitudInfo data={solicitudInfo} />}
      {reclamoInfo && <ReclamoInfo data={reclamoInfo} />}
    </>
  );
};

export default TicketTypeInfoSection;
export { ConsultaInfo, QuejaInfo, SolicitudInfo, ReclamoInfo };
