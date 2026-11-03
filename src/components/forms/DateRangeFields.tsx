import { useFormContext, type Path } from "react-hook-form";
import type { CVData } from "@/types/cv";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

function MonthYearInput({
  value,
  onChange,
  onBlur,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  const [month, year] = (value || "").split(".");
  const inputValue = year && month ? `${year}-${month}` : "";

  return (
    <Input
      type="month"
      value={inputValue}
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) => {
        const val = e.target.value;
        if (val) {
          const [y, m] = val.split("-");
          onChange(`${m}.${y}`);
        } else {
          onChange("");
        }
      }}
    />
  );
}

interface DateRangeFieldsProps {
  startName: Path<CVData>;
  endName: Path<CVData>;
  currentLabel: string;
  currentCheckboxId: string;
}

export function DateRangeFields({
  startName,
  endName,
  currentLabel,
  currentCheckboxId,
}: DateRangeFieldsProps) {
  const { control, setValue, getValues } = useFormContext<CVData>();

  const handleStartDateChange = (
    newVal: string,
    fieldChange: (val: string) => void,
  ) => {
    fieldChange(newVal);

    // Jeśli podano datę startową, a data końcowa jest pusta, automatycznie zaznaczamy "Obecnie"
    const currentEndVal = (getValues(endName) as string) || "";
    if (newVal && !currentEndVal) {
      setValue(endName, "Obecnie" as any, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <>
      <FormField
        control={control}
        name={startName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data rozpoczęcia</FormLabel>
            <FormControl>
              <MonthYearInput
                value={(field.value as string) || ""}
                onChange={(val) => handleStartDateChange(val, field.onChange)}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={endName}
        render={({ field }) => {
          const isCurrent = field.value === "Obecnie";

          return (
            <FormItem>
              <FormLabel>Data zakończenia</FormLabel>
              <FormControl>
                {isCurrent ? (
                  <Input
                    disabled
                    value="Obecnie"
                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium cursor-not-allowed"
                  />
                ) : (
                  <MonthYearInput
                    value={(field.value as string) || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              </FormControl>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id={currentCheckboxId}
                  checked={isCurrent}
                  onChange={(e) => {
                    field.onChange(e.target.checked ? "Obecnie" : "");
                  }}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer w-4 h-4"
                />
                <label
                  htmlFor={currentCheckboxId}
                  className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none"
                >
                  {currentLabel}
                </label>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
}
