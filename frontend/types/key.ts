export type Shortcut = {
  key: string;          // ex: "c"
  ctrl?: boolean;       // Ctrl (ou Cmd sur Mac via meta)
  shift?: boolean;
  alt?: boolean;
  action: string;       // identifiant logique
};