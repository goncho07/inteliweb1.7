/**
 * Generación determinista de avatares de estudiante (avataaars.io).
 * El mismo estudiante produce siempre el mismo avatar porque todo deriva
 * de un hash de su nombre combinado con su id.
 */

const MALE_NAMES = new Set([
  'Mateo', 'Santiago', 'Thiago', 'Liam', 'Gael', 'Alessandro', 'Nicolas', 'Benjamin',
  'Sebastian', 'Matias', 'Diego', 'Joaquin', 'Carlos', 'Jose', 'Luis', 'Jorge', 'Piero',
]);

const HAIR_COLORS = ['Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'Black', 'Red'];
const CLOTHES_COLORS = ['Blue01', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'Red', 'PastelBlue'];
const SKIN_COLORS = ['Tanned', 'Pale', 'Light', 'Brown', 'DarkBrown'];
const ACCESSORIES = ['Blank', 'Blank', 'Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Blank'];

/** Estilos de uniforme escolar. */
const SCHOOL_CLOTHES = ['BlazerShirt', 'BlazerSweater', 'CollarSweater'];

const MALE_TOPS = [
  'ShortHairDreads01', 'ShortHairShortCurly', 'ShortHairShortFlat',
  'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides',
  'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
];

const FEMALE_TOPS = [
  'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly',
  'LongHairCurvy', 'LongHairNotTooLong', 'LongHairStraight',
  'LongHairStraight2', 'LongHairStraightStrand',
];

export const getStudentAvatarUrl = (student: { id?: string | number; name: string }) => {
  const firstName = student.name.split(' ')[0];
  const isMale = MALE_NAMES.has(firstName);

  let hash = 0;
  for (let i = 0; i < student.name.length; i++) {
    hash += student.name.charCodeAt(i);
  }

  // Se usa el id numérico si existe; si no, el hash del nombre.
  const idValue = student.id
    ? parseInt(String(student.id).replace(/\D/g, ''), 10) || hash
    : hash;
  // Se combinan para evitar patrones cuando los ids son secuenciales.
  const id = idValue + hash;

  const hair = HAIR_COLORS[id % HAIR_COLORS.length];
  const clothesColor = CLOTHES_COLORS[(id + 1) % CLOTHES_COLORS.length];
  const skin = SKIN_COLORS[(id + 2) % SKIN_COLORS.length];
  const acc = ACCESSORIES[(id + 3) % ACCESSORIES.length];
  const clothe = SCHOOL_CLOTHES[(id + 4) % SCHOOL_CLOTHES.length];

  const top = isMale
    ? MALE_TOPS[(id + 5) % MALE_TOPS.length]
    : FEMALE_TOPS[(id + 5) % FEMALE_TOPS.length];

  return `https://avataaars.io/?avatarStyle=Transparent&topType=${top}&accessoriesType=${acc}&hairColor=${hair}&facialHairType=Blank&clotheType=${clothe}&clotheColor=${clothesColor}&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=${skin}`;
};
