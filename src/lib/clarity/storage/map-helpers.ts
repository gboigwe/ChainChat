// Clarity v4 define-map pattern helpers
/** Generic map key type */
export type MapKey = Record<string, unknown>;
/** Generic map value type */
export type MapValue = Record<string, unknown>;
/** Map entry tuple */
export interface MapEntry<K extends MapKey, V extends MapValue> {
  key: K;
  value: V;
}
