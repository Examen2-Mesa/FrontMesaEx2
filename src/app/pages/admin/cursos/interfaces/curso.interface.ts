export interface Curso {
  nombre:   string;
  nivel:    Nivel;
  paralelo: Paralelo;
  turno:    Turno;
  id?:       number;
}

export enum Nivel {
  Inicial = "Inicial",
  Primaria = "Primaria",
  Secundaria = "Secundaria",
}

export enum Paralelo {
  A = "A",
  B = "B",
}

export enum Turno {
  Mañana = "Mañana",
  Tarde = "Tarde",
  Noche = "Noche",
}
