import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cvSchema } from "@/types/cv";
import type { CVData } from "@/types/cv";
import { CVForm } from "@/components/CVForm";
import { CVPreview } from "@/components/CVPreview";
import { useVariants, emptyCVData } from "@/hooks/useVariants";
import { VariantsManager } from "@/components/VariantsManager";
import { mockCVData } from "@/lib/mockData";
import { ThemeProvider } from "@/components/theme-provider";
import { ImportPDFModal } from "@/components/ImportPDFModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobMatchModal } from "@/components/JobMatchModal";

export function App() {
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isJobMatchOpen, setIsJobMatchOpen] = useState(false);

  const methods = useForm<CVData>({
    resolver: zodResolver(cvSchema),
    defaultValues: emptyCVData,
  });

  const manager = useVariants(methods);
  const activeVariantName =
    manager.variants.find((v) => v.id === manager.activeId)?.name ||
    "Warianty CV";

  const loadMockData = () => methods.reset(mockCVData);

  const clearAllData = () => {
    methods.reset(emptyCVData);
    window.dispatchEvent(new CustomEvent("reset-step"));
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);

    const { firstName, lastName } = methods.getValues("personalInfo") || {};
    const originalTitle = document.title;
    const cleanFirst = (firstName || "").trim();
    const cleanLast = (lastName || "").trim();

    if (cleanFirst || cleanLast) {
      document.title = `CV_${cleanFirst}_${cleanLast}`.replace(/\s+/g, "_");
    } else {
      document.title = "CV";
    }

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setIsGeneratingPDF(false);
    }, 150);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="cv-builder-theme">
      <FormProvider {...methods}>
        <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
          <div className="print:hidden">
            <Navbar
              activeVariantName={activeVariantName}
              isGeneratingPDF={isGeneratingPDF}
              onOpenVariantsModal={() => setIsVariantsOpen(true)}
              onOpenImportModal={() => setIsImportOpen(true)}
              onOpenJobMatchModal={() => setIsJobMatchOpen(true)}
              onLoadMockData={loadMockData}
              onClearAllData={clearAllData}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>

          <main className="flex-1 flex overflow-hidden print:overflow-visible print:block">
            <section className="flex-1 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 print:hidden flex flex-col relative z-10">
              <CVForm />
            </section>

            <section className="flex-1 h-full bg-zinc-200/50 dark:bg-zinc-900 flex flex-col relative print:w-full print:h-auto print:bg-white print:block">
              <div className="w-full flex justify-center py-3 shrink-0 print:hidden pointer-events-none">
                <div className="flex items-center gap-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-zinc-200/80 dark:border-zinc-700 px-4 py-1.5 rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-zinc-600 dark:text-zinc-300 uppercase">
                    Na żywo
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full overflow-y-auto flex justify-center items-start pb-12 print:block print:p-0 print:overflow-visible">
                <div
                  id="scale-wrapper"
                  className="origin-top shadow-2xl transition-all duration-300 dark:brightness-90 hover:dark:brightness-100 print:!transform-none print:shadow-none print:!filter-none"
                  style={{
                    transform: "scale(calc(min(1, (100vh - 120px) / 1123)))",
                  }}
                >
                  <CVPreview />
                </div>
              </div>
            </section>
          </main>

          <div className="print:hidden">
            <Footer />
          </div>
        </div>

        <VariantsManager
          isOpen={isVariantsOpen}
          onClose={() => setIsVariantsOpen(false)}
          variants={manager.variants}
          activeId={manager.activeId}
          onSwitch={manager.switchVariant}
          onAdd={manager.addVariant}
          onRename={manager.renameVariant}
          onDelete={manager.deleteVariant}
        />

        <ImportPDFModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={(parsedData) => {
            const currentTheme = methods.getValues("theme");
            const mergedData = {
              ...emptyCVData,
              ...parsedData,
              theme: currentTheme,
            };
            methods.reset(mergedData);
            window.dispatchEvent(new CustomEvent("reset-step"));
          }}
        />

        <JobMatchModal
          isOpen={isJobMatchOpen}
          onClose={() => setIsJobMatchOpen(false)}
          onCreateTailoredVariant={(
            variantName: string,
            updatedData: CVData,
          ) => {
            manager.createVariantWithData(variantName, updatedData);
          }}
        />
      </FormProvider>
    </ThemeProvider>
  );
}

export default App;
