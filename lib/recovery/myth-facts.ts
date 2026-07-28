/**
 * Daily "Mitos vs Fakta" bank. Statements and explanations live in the
 * `mythFact` namespace (messages/{id,en}/engagement.json); only the stable
 * key and the correct answer live in code so the answer never depends on
 * translated text. Selection rotates deterministically by day of year.
 */
export interface MythFactEntry {
  key: `mf${number}`;
  answer: 'myth' | 'fact';
}

export const MYTH_FACTS: readonly MythFactEntry[] = [
  { key: 'mf1', answer: 'myth' }, // "gacor" streaks
  { key: 'mf2', answer: 'fact' }, // house edge
  { key: 'mf3', answer: 'myth' }, // near-miss means closer
  { key: 'mf4', answer: 'myth' }, // chase losses to break even
  { key: 'mf5', answer: 'fact' }, // hot-hand is a bias
  { key: 'mf6', answer: 'fact' }, // time distortion
  { key: 'mf7', answer: 'myth' }, // skill beats slots
  { key: 'mf8', answer: 'fact' }, // early wins are designed
  { key: 'mf9', answer: 'myth' }, // due for a win after losses
  { key: 'mf10', answer: 'fact' }, // urges pass on their own
  { key: 'mf11', answer: 'myth' }, // small bets are harmless
  { key: 'mf12', answer: 'fact' }, // ads curate winners
  { key: 'mf13', answer: 'myth' }, // borrowing to play once is fine
  { key: 'mf14', answer: 'fact' }, // triggers can be mapped
  { key: 'mf15', answer: 'myth' }, // stopping means weak will
  { key: 'mf16', answer: 'fact' }, // environment design works
  { key: 'mf17', answer: 'myth' }, // one more round to feel better
  { key: 'mf18', answer: 'fact' }, // sleep affects self-control
  { key: 'mf19', answer: 'myth' }, // only weak people get hooked
  { key: 'mf20', answer: 'fact' }, // naming feelings lowers intensity
  { key: 'mf21', answer: 'myth' }, // winning back proves control
  { key: 'mf22', answer: 'fact' }, // variable rewards hook the brain
  { key: 'mf23', answer: 'myth' }, // lucky items and rituals help
  { key: 'mf24', answer: 'fact' }, // support speeds recovery
  { key: 'mf25', answer: 'myth' }, // online games are fairer
  { key: 'mf26', answer: 'fact' }, // slips are part of recovery
  { key: 'mf27', answer: 'myth' }, // watching streams is harmless
  { key: 'mf28', answer: 'fact' }, // money limits work best pre-set
  { key: 'mf29', answer: 'myth' }, // quitting must happen alone
  { key: 'mf30', answer: 'fact' }, // boredom is a common trigger
] as const;
