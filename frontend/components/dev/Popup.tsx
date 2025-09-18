"use client";
import { Check, CircleX, SendHorizonal, X } from "lucide-react";
import { useState } from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// ====================
// Types
// ====================
type PopUpType = {
  id: string;
  header: string;
  body: string;
  statut: "error" | "success" | "default";
};

type PopUpStoreType = {
  popUps: PopUpType[];
  actions: {
    addPopUp: (popUp: Omit<PopUpType, "id">) => void;
    removePopUp: (id: string) => void;
  };
};

// ====================
// Zustand Store
// ====================
const usePopUpStore = create<PopUpStoreType>((set) => ({
  popUps: [],
  actions: {
    addPopUp: (popUp) =>
      set((state) => ({
        popUps: [...state.popUps, { ...popUp, id: uuidv4() }],
      })),
    removePopUp: (id) =>
      set((state) => ({
        popUps: state.popUps.filter((p) => p.id !== id),
      })),
  },
}));

// ====================
// Hook global pour ajouter un popup
// ====================
export function addPopUp(popUp: Omit<PopUpType, "id">) {
  const { addPopUp } = usePopUpStore.getState().actions;
  addPopUp(popUp);
}

// ====================
// PopUp Component
// ====================
function PopUp({ id, header, body, statut }: PopUpType) {
  const removePopUp = usePopUpStore((state) => state.actions.removePopUp);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    // Déclenche l'animation
    setIsVisible(false);
    // Supprime après 300ms (durée animation)
    setTimeout(() => removePopUp(id), 300);
  };

  return (
    <div
      className={`flex flex-col w-72 p-3 bg-white border rounded-lg shadow h-fit border-muted-foreground
        transform transition-all duration-300
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
    >
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-bold">{header}</p>
        <X
          className="w-4 h-4 text-gray-500 hover:cursor-pointer hover:text-black"
          onClick={handleClose}
        />
      </div>
      <div className="mb-2 text-muted-foreground">{body}</div>

      {statut === "error" && (
        <div className="flex items-center justify-center gap-1 px-2 py-[0.1rem] text-xs text-orange-500 border-2 border-orange-500 rounded-md bg-orange-500/10 w-fit">
          <CircleX className="w-3 h-3 align-middle" />
          <p>error</p>
        </div>
      )}
      {statut === "success" && (
        <div className="flex items-center justify-center gap-1 px-2 py-[0.1rem] text-xs text-green-500 border-2 border-green-500 rounded-md bg-green-500/10 w-fit">
          <Check className="w-3 h-3 align-middle" />
          success
        </div>
      )}
      {statut === "default" && (
        <div className="flex items-center justify-center gap-1 px-2 py-[0.1rem] text-xs border-2 rounded-md text-neutral-500 border-neutral-500 bg-neutral-500/10 w-fit">
          <SendHorizonal className="w-3 h-3 align-middle" />
          default
        </div>
      )}
    </div>
  );
}

// ====================
// PopUpContainer
// ====================
export default function PopUps() {
  const popUps = usePopUpStore((state) => state.popUps);

  return (
    <div className="absolute pointer-events-none z-50 hidden md:flex flex-col items-end top-2 right-2 gap-2 h-[50vh] overflow-y-scroll border-dashed border-muted-foreground border-2 rounded-lg p-2">
      {popUps.map((p) => (
        <PopUp key={p.id} {...p} />
      ))}
    </div>
  );
}
