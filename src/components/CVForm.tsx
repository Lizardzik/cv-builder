import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  FileText,
  Palette,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CVData } from "@/types/cv";

import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { ExperienceForm } from "./forms/ExperienceForm";
import { ProjectsForm } from "./forms/ProjectsForm";
import { EducationForm } from "./forms/EducationForm";
import { SkillsForm } from "./forms/SkillsForm";
import { ExtrasForm } from "./forms/ExtrasForm";
import { SummaryForm } from "./forms/SummaryForm";
import { ThemeSettingsForm } from "./forms/ThemeSettingsForm";

const STEPS = [
  { id: 0, title: "Kontakt", icon: User },
  { id: 1, title: "Doświadczenie", icon: Briefcase },
  { id: 2, title: "Projekty", icon: FolderGit2 },
  { id: 3, title: "Edukacja", icon: GraduationCap },
  { id: 4, title: "Umiejętności", icon: Wrench },
  { id: 5, title: "Dodatki", icon: PlusCircle },
  { id: 6, title: "Podsumowanie", icon: FileText },
  { id: 7, title: "Wygląd", icon: Palette },
];

const THEME_STEP_ID = 7;

export function CVForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const form = useFormContext<CVData>();
  const data = form.watch();

  useEffect(() => {
    const handleReset = () => setCurrentStep(0);
    window.addEventListener("reset-step", handleReset);
    return () => window.removeEventListener("reset-step", handleReset);
  }, []);

  const getProgress = (id: number) => {
    if (id === 0) {
      const personal = data.personalInfo || {};
      const baseFilled = [
        personal.firstName,
        personal.lastName,
        personal.email,
        personal.jobTitle,
      ].filter((field) => field && field.trim().length > 0).length;

      if (baseFilled < 4) return (baseFilled / 4) * 80;

      if (personal.customLinks && personal.customLinks.length > 0) {
        const validLinks = personal.customLinks.every(
          (link) => link.url && link.url.trim().length > 0,
        );
        return validLinks ? 100 : 85;
      }
      return 100;
    }

    if (id === 1) {
      if (!data.experience || data.experience.length === 0) return 100;
      const allValid = data.experience.every(
        (exp) =>
          exp.company?.trim() && exp.position?.trim() && exp.startDate?.trim(),
      );
      return allValid ? 100 : 50;
    }

    if (id === 2) {
      if (!data.projects || data.projects.length === 0) return 100;
      const allValid = data.projects.every(
        (proj) => proj.name && proj.name.trim().length >= 2,
      );
      return allValid ? 100 : 50;
    }

    if (id === 3) {
      if (!data.education || data.education.length === 0) return 100;
      const allValid = data.education.every(
        (edu) =>
          edu.school?.trim() && edu.degree?.trim() && edu.startDate?.trim(),
      );
      return allValid ? 100 : 50;
    }

    if (id === 4) {
      if (!data.skills || data.skills.length === 0) return 100;
      const hasEmpty = data.skills.some(
        (skill) => !skill.name || skill.name.trim().length === 0,
      );
      return hasEmpty ? 50 : 100;
    }

    if (id === 5) {
      const langsValid = (data.languages || []).every(
        (lang) => lang.name?.trim() && lang.level?.trim(),
      );
      const coursesValid = (data.courses || []).every((course) =>
        course.name?.trim(),
      );
      return langsValid && coursesValid ? 100 : 50;
    }

    if (id === 6 || id === 7) return 100;
    return 0;
  };

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    return getProgress(0) === 100;
  };

  const clearCurrentSection = () => {
    switch (currentStep) {
      case 0:
        form.setValue("personalInfo", {
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
        });
        break;
      case 1:
        form.setValue("experience", []);
        break;
      case 2:
        form.setValue("projects", []);
        break;
      case 3:
        form.setValue("education", []);
        break;
      case 4:
        form.setValue("skills", []);
        break;
      case 5:
        form.setValue("languages", []);
        form.setValue("courses", []);
        break;
      case 6:
        form.setValue("summary", "");
        form.setValue("clause", "");
        break;
    }
  };

  const resetThemeToDefault = () => {
    form.setValue(
      "theme",
      {
        font: "font-sans",
        color: "#1d4ed8",
        textColor: "#18181b",
        backgroundColor: "#ffffff",
        spacing: 16,
        fontSize: 13,
        layout: "classic",
        customFont: "",
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoForm />;
      case 1:
        return <ExperienceForm />;
      case 2:
        return <ProjectsForm />;
      case 3:
        return <EducationForm />;
      case 4:
        return <SkillsForm />;
      case 5:
        return <ExtrasForm />;
      case 6:
        return <SummaryForm />;
      case 7:
        return <ThemeSettingsForm />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div
        className={cn(
          "bg-zinc-50/50 dark:bg-zinc-900/30 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-20",
          isCollapsed ? "w-20" : "w-1/3 max-w-[260px]",
        )}
      >
        <div className="flex items-center justify-between p-4 h-[72px] border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed && (
            <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider pl-1">
              Sekcje
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800",
              isCollapsed && "mx-auto",
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Rozwiń nawigację" : "Zwiń nawigację"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const progress = getProgress(step.id);
            const unlocked = isUnlocked(step.id);

            return (
              <button
                key={step.id}
                onClick={() => unlocked && setCurrentStep(step.id)}
                disabled={!unlocked}
                title={isCollapsed ? step.title : undefined}
                className={cn(
                  "flex flex-col text-left transition-all relative overflow-hidden group rounded-xl",
                  isCollapsed ? "p-3 items-center justify-center" : "p-3",
                  isActive
                    ? "bg-white dark:bg-zinc-800 shadow-sm border border-indigo-200 dark:border-indigo-900/50 ring-1 ring-indigo-600"
                    : unlocked
                      ? "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm border border-transparent"
                      : "opacity-50 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "flex items-center relative z-10 w-full",
                    !isCollapsed ? "gap-3 mb-1" : "justify-center",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-colors",
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : progress === 100
                          ? "border-emerald-600 text-emerald-600 bg-white dark:bg-zinc-900"
                          : "border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 pt-0.5">
                      <span
                        className={cn(
                          "font-medium text-sm block truncate",
                          isActive
                            ? "text-indigo-950 dark:text-indigo-100"
                            : "text-zinc-700 dark:text-zinc-300",
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                  )}
                </div>

                {!isCollapsed && unlocked && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden relative z-10 mt-1.5">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        progress === 100 ? "bg-emerald-600" : "bg-indigo-500",
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 relative min-w-0">
        <div className="flex-1 overflow-y-auto p-10 text-zinc-900 dark:text-zinc-100">
          {renderStep()}
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 p-6 flex justify-between items-center bg-white dark:bg-zinc-950 shrink-0 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="text-zinc-500 dark:text-zinc-400 hover:dark:text-zinc-200"
          >
            Wstecz
          </Button>

          <div className="flex gap-3">
            {currentStep === THEME_STEP_ID ? (
              <Button
                type="button"
                variant="outline"
                onClick={resetThemeToDefault}
                className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-zinc-200 dark:border-zinc-800"
              >
                Przywróć domyślne
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={clearCurrentSection}
                className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border-dashed dark:border-zinc-700"
              >
                Wyczyść sekcję
              </Button>
            )}

            <Button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
              onClick={() =>
                setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))
              }
              disabled={
                currentStep === STEPS.length - 1 || !isUnlocked(currentStep + 1)
              }
            >
              Dalej
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
