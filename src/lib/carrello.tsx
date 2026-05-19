"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Confezione, FontDedica, ItemColore } from "@/lib/configuratore";
import { Animale } from "@/lib/animali";

export type ArticoloCarrello = {
  id: string;
  animale: Animale;
  coloreCiondolo: "nero" | "bianco";
  smalto: ItemColore;
  occhioSx: ItemColore;
  occhioDx: ItemColore;
  cordino: ItemColore;
  dedicaHum: string;
  fontDedicaHum: FontDedica | null;
  aggiungPet: boolean;
  coloreCiondoloPet: "nero" | "bianco" | null;
  occhioSxPet: ItemColore | null;
  occhioDxPet: ItemColore | null;
  dedicaPet: string;
  fontDedicaPet: FontDedica | null;
  sizePet: string | null;
  etichettaSizePet: string | null;
  confezione: Confezione;
  quantitaHum: number;
  quantitaPet: number;
  prezzoHumSolo: number;
  prezzoHumPet: number;
};

type CarrelloCtx = {
  articoli: ArticoloCarrello[];
  aggiungi: (a: ArticoloCarrello) => void;
  rimuovi: (id: string) => void;
  svuota: () => void;
  totale: number;
  totalePezzi: number;
};

const CarrelloContext = createContext<CarrelloCtx>({
  articoli: [],
  aggiungi: () => {},
  rimuovi: () => {},
  svuota: () => {},
  totale: 0,
  totalePezzi: 0,
});

export function CarrelloProvider({ children }: { children: ReactNode }) {
  const [articoli, setArticoli] = useState<ArticoloCarrello[]>([]);

  function aggiungi(a: ArticoloCarrello) {
    setArticoli(prev => [...prev, a]);
  }

  function rimuovi(id: string) {
    setArticoli(prev => prev.filter(a => a.id !== id));
  }

  function svuota() {
    setArticoli([]);
  }

  const totale = articoli.reduce((acc, a) => {
    const righeConPet = a.quantitaPet;
    const righeSoloHum = a.quantitaHum - a.quantitaPet;
    return acc + (righeConPet * a.prezzoHumPet) + (righeSoloHum * a.prezzoHumSolo);
  }, 0);

  const totalePezzi = articoli.reduce((acc, a) => acc + a.quantitaHum, 0);

  return (
    <CarrelloContext.Provider value={{ articoli, aggiungi, rimuovi, svuota, totale, totalePezzi }}>
      {children}
    </CarrelloContext.Provider>
  );
}

export function useCarrello() {
  return useContext(CarrelloContext);
}
