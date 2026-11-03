import { useState, useEffect, useRef, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CVData } from "@/types/cv";

export interface Variant {
  id: string;
  name: string;
  updatedAt: number;
  data: CVData;
}

export const emptyCVData: CVData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    phone: "",
    city: "",
    postalCode: "",
    dateOfBirth: "",
    github: "",
    linkedin: "",
    photo: "",
    customLinks: [],
  },
  experience: [],
  projects: [],
  education: [],
  skills: [],
  languages: [],
  courses: [],
  summary: "",
  clause: "",
  theme: {
    font: "font-sans",
    color: "#1d4ed8",
    textColor: "#18181b",
    backgroundColor: "#ffffff",
    spacing: 16,
    fontSize: 13,
    layout: "classic",
    customFont: "",
  },
};

const STORAGE_KEY = "cv-variants";

function persistVariants(activeId: string, variants: Variant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId, variants }));
}

export function useVariants(methods: UseFormReturn<CVData>) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const isResettingRef = useRef(false);

  const safeFormReset = useCallback(
    (data: CVData) => {
      isResettingRef.current = true;
      methods.reset({
        ...emptyCVData,
        ...data,
        projects: data.projects || [],
      });
      setTimeout(() => {
        isResettingRef.current = false;
      }, 50);
    },
    [methods]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          setVariants(parsed.variants);
          const targetId = parsed.activeId || parsed.variants[0].id;
          setActiveId(targetId);

          const active = parsed.variants.find((v: Variant) => v.id === targetId);
          if (active) {
            safeFormReset(active.data);
          }
          return;
        }
      }

      const oldData = localStorage.getItem("cv-builder-data");
      const initData = oldData ? JSON.parse(oldData) : emptyCVData;
      const initialVariant: Variant = {
        id: Date.now().toString(),
        name: "Główne CV",
        updatedAt: Date.now(),
        data: initData,
      };

      setVariants([initialVariant]);
      setActiveId(initialVariant.id);
      safeFormReset(initData);
      persistVariants(initialVariant.id, [initialVariant]);
    } catch (error) {
      console.error("Błąd podczas wczytywania wariantów CV:", error);
    }
  }, [safeFormReset]);

  useEffect(() => {
    if (!activeId) return;

    const subscription = methods.watch(() => {
      if (isResettingRef.current) return;

      const currentValues = methods.getValues();

      setVariants((prevVariants) => {
        const updated = prevVariants.map((variant) =>
          variant.id === activeId
            ? { ...variant, data: currentValues, updatedAt: Date.now() }
            : variant
        );
        persistVariants(activeId, updated);
        return updated;
      });
    });

    return () => subscription.unsubscribe();
  }, [activeId, methods]);

  const syncCurrentActiveVariant = (): Variant[] => {
    const currentData = methods.getValues();
    return variants.map((variant) =>
      variant.id === activeId
        ? { ...variant, data: currentData, updatedAt: Date.now() }
        : variant
    );
  };

  const switchVariant = (id: string) => {
    if (id === activeId) return;

    const updatedVariants = syncCurrentActiveVariant();
    const target = updatedVariants.find((variant) => variant.id === id);
    if (!target) return;

    setActiveId(id);
    setVariants(updatedVariants);
    safeFormReset(target.data);
    persistVariants(id, updatedVariants);
    window.dispatchEvent(new CustomEvent("reset-step"));
  };

  const createVariantWithData = (name: string, targetData: CVData) => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: name.trim() || "Nowy wariant",
      updatedAt: Date.now(),
      data: targetData,
    };

    const updatedVariants = [...syncCurrentActiveVariant(), newVariant];

    setVariants(updatedVariants);
    setActiveId(newVariant.id);
    safeFormReset(targetData);
    persistVariants(newVariant.id, updatedVariants);
    window.dispatchEvent(new CustomEvent("reset-step"));
  };

  const addVariant = (name: string, cloneCurrent: boolean) => {
    const dataToSave = cloneCurrent ? methods.getValues() : emptyCVData;
    createVariantWithData(name, dataToSave);
  };

  const renameVariant = (id: string, newName: string) => {
    setVariants((prev) => {
      const updated = prev.map((variant) =>
        variant.id === id ? { ...variant, name: newName } : variant
      );
      persistVariants(activeId, updated);
      return updated;
    });
  };

  const deleteVariant = (id: string) => {
    if (variants.length <= 1) return;

    const updated = variants.filter((variant) => variant.id !== id);

    if (activeId === id) {
      const nextActive = updated[0];
      setActiveId(nextActive.id);
      setVariants(updated);
      safeFormReset(nextActive.data);
      persistVariants(nextActive.id, updated);
    } else {
      setVariants(updated);
      persistVariants(activeId, updated);
    }
  };

  return {
    variants,
    activeId,
    switchVariant,
    addVariant,
    createVariantWithData,
    renameVariant,
    deleteVariant,
  };
}