const fs = require('fs');

const code = fs.readFileSync('modules/ClassroomsModule.tsx', 'utf8');

const startIdx = code.indexOf('const CitationsPanel: React.FC<{');
if (startIdx !== -1) {
  let panelCode = code.slice(startIdx);
  
  // Replace Citations terms with Incidents terms
  panelCode = panelCode.replace(/CitationsPanel/g, 'IncidenciasPanel');
  panelCode = panelCode.replace(/Comunicados/g, 'Incidencias');
  panelCode = panelCode.replace(/comunicados/g, 'incidencias');
  panelCode = panelCode.replace(/Comunicado /g, 'Incidencia ');
  panelCode = panelCode.replace(/Enviar comunicado/g, 'Registrar incidencia');
  panelCode = panelCode.replace(/Nuevo Comunicado/g, 'Nueva Incidencia');
  panelCode = panelCode.replace(/Asunto del Comunicado/g, 'Asunto de la Incidencia');
  panelCode = panelCode.replace(/Motivo del comunicado/g, 'Motivo de la incidencia');
  panelCode = panelCode.replace(/Historial de Comunicados/g, 'Historial de Incidencias');
  panelCode = panelCode.replace(/selectedStudentToCite/g, 'selectedStudentToIncident');
  panelCode = panelCode.replace(/CitationItem/g, 'IncidentItem'); 
  panelCode = panelCode.replace(/citations/g, 'incidents');
  panelCode = panelCode.replace(/setCitations/g, 'setIncidents');
  panelCode = panelCode.replace(/citationModal/g, 'incidentModal');
  panelCode = panelCode.replace(/setCitationModal/g, 'setIncidentModal');
  panelCode = panelCode.replace(/citeReason/g, 'incidentReason');
  panelCode = panelCode.replace(/setCiteReason/g, 'setIncidentReason');
  panelCode = panelCode.replace(/customCiteReason/g, 'customIncidentReason');
  panelCode = panelCode.replace(/setCustomCiteReason/g, 'setCustomIncidentReason');
  panelCode = panelCode.replace(/citeSchedDate/g, 'incidentSchedDate');
  panelCode = panelCode.replace(/setCiteSchedDate/g, 'setIncidentSchedDate');
  panelCode = panelCode.replace(/citeSchedTime/g, 'incidentSchedTime');
  panelCode = panelCode.replace(/setCiteSchedTime/g, 'setIncidentSchedTime');

  panelCode = panelCode.replace(/handleQuickCite/g, 'handleQuickIncident');
  panelCode = panelCode.replace(/handleCompleteCite/g, 'handleCompleteIncident');
  
  fs.writeFileSync('modules/ClassroomsModule.tsx', code + "\n\n" + panelCode);
  console.log('Successfully added IncidenciasPanel.');
} else {
  console.log('Could not find CitationsPanel.');
}

