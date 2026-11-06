// Nombres ONU; descripciones educativas resumidas por la plataforma.
export const SDGS = [
  ["Fin de la pobreza", "Acceso a recursos y protección social."],
  ["Hambre cero", "Alimentación y agricultura sostenible."],
  ["Salud y bienestar", "Salud y servicios accesibles."],
  ["Educación de calidad", "Aprendizaje inclusivo."],
  ["Igualdad de género", "Eliminar barreras de género."],
  ["Agua limpia y saneamiento", "Acceso y gestión del agua."],
  ["Energía asequible y no contaminante", "Acceso a energía y eficiencia."],
  ["Trabajo decente y crecimiento económico", "Condiciones laborales dignas."],
  ["Industria, innovación e infraestructura", "Infraestructura e innovación responsables."],
  ["Reducción de las desigualdades", "Reducir barreras sociales y económicas."],
  ["Ciudades y comunidades sostenibles", "Habitabilidad y resiliencia urbana."],
  ["Producción y consumo responsables", "Uso responsable de recursos."],
  ["Acción por el clima", "Responder al cambio climático."],
  ["Vida submarina", "Protección de mares y ecosistemas acuáticos."],
  ["Vida de ecosistemas terrestres", "Protección de biodiversidad, suelos y bosques."],
  ["Paz, justicia e instituciones sólidas", "Justicia, transparencia y participación."],
  ["Alianzas para lograr los objetivos", "Colaboración para el desarrollo sostenible."],
].map(([name, description], i) => ({ id: i + 1, name, description }));
export const SUSTAINABILITY_REFERENCES = [
  { name: "ODS de Naciones Unidas", url: "https://www.un.org/sustainabledevelopment/es/sustainable-development-goals/" },
  { name: "Educación para el desarrollo sostenible · UNESCO", url: "https://www.unesco.org/es/sustainable-development/education/need-know" },
  { name: "Principios de Green Software", url: "https://learn.greensoftware.foundation/" },
];
