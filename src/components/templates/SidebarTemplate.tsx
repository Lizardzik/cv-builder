import type { CVData } from "@/types/cv";

interface SidebarTemplateProps {
  data: CVData;
  primaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  spacing?: number;
}

export function SidebarTemplate({
  data,
  primaryColor = "#047857",
  textColor = "#18181b",
  backgroundColor = "#ffffff",
  fontSize = 13,
  spacing = 16,
}: SidebarTemplateProps) {
  const {
    personalInfo,
    summary,
    experience,
    projects,
    education,
    skills,
    languages,
    courses,
    interests,
  } = data;

  const sectionGap = `${spacing}px`;
  const itemGap = `${Math.max(Math.round(spacing * 0.5), 4)}px`;

  return (
    <div
      className="w-full flex min-h-[1123px] leading-relaxed shadow-lg"
      style={{ backgroundColor, fontSize: `${fontSize}px` }}
    >
      {/* LEWY PANEL (SIDEBAR) */}
      <div
        className="w-[32%] p-6 text-white flex flex-col justify-between shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="space-y-5">
          {personalInfo?.photo && (
            <div className="flex justify-center mb-2">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md">
                <img
                  src={personalInfo.photo}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <h1
              className="font-bold tracking-tight leading-tight"
              style={{ fontSize: `${fontSize * 1.5}px` }}
            >
              {personalInfo?.firstName} {personalInfo?.lastName}
            </h1>
            {personalInfo?.jobTitle && (
              <p
                className="text-white/80 font-medium"
                style={{ fontSize: `${fontSize * 0.9}px` }}
              >
                {personalInfo.jobTitle}
              </p>
            )}
          </div>

          {/* KONTAKT I LINKI */}
          <div className="space-y-2 border-t border-white/20 pt-3">
            <h2
              className="font-bold uppercase tracking-wider text-white/70 mb-2"
              style={{ fontSize: `${fontSize * 0.75}px` }}
            >
              Kontakt
            </h2>
            {personalInfo?.email && (
              <div
                className="break-all text-white/90"
                style={{ fontSize: `${fontSize * 0.85}px` }}
              >
                {personalInfo.email}
              </div>
            )}
            {personalInfo?.phone && (
              <div
                className="text-white/90"
                style={{ fontSize: `${fontSize * 0.85}px` }}
              >
                +48 {personalInfo.phone}
              </div>
            )}
            {personalInfo?.city && (
              <div
                className="text-white/90"
                style={{ fontSize: `${fontSize * 0.85}px` }}
              >
                {personalInfo.city}
              </div>
            )}

            {/* Linia oddzielająca dane od linków */}
            {personalInfo?.customLinks &&
              personalInfo.customLinks.length > 0 && (
                <div className="border-t border-white/15 pt-2.5 mt-2.5 space-y-2">
                  {personalInfo.customLinks.map((link, i) => (
                    <div
                      key={i}
                      className="space-y-0.5"
                      style={{ fontSize: `${fontSize * 0.85}px` }}
                    >
                      <div className="font-semibold text-white/90 leading-tight">
                        {link.label}:
                      </div>
                      <a
                        href={
                          link.url.startsWith("http")
                            ? link.url
                            : `https://${link.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="block underline text-white/80 hover:text-white break-all leading-tight"
                      >
                        {link.url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {skills && skills.length > 0 && (
            <div className="border-t border-white/20 pt-3">
              <h2
                className="font-bold uppercase tracking-wider text-white/70 mb-2.5"
                style={{ fontSize: `${fontSize * 0.75}px` }}
              >
                Umiejętności
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-white/15 px-2 py-0.5 rounded font-medium text-white break-words"
                    style={{ fontSize: `${fontSize * 0.8}px` }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div className="border-t border-white/20 pt-3">
              <h2
                className="font-bold uppercase tracking-wider text-white/70 mb-2"
                style={{ fontSize: `${fontSize * 0.75}px` }}
              >
                Języki
              </h2>
              <div className="space-y-1">
                {languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex justify-between"
                    style={{ fontSize: `${fontSize * 0.85}px` }}
                  >
                    <span className="font-medium text-white">{lang.name}</span>
                    <span className="text-white/70">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRAWY PANEL (GŁÓWNA TREŚĆ) */}
      <div
        className="w-[68%] p-6 flex flex-col justify-between"
        style={{ color: textColor }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: sectionGap }}
        >
          {summary && (
            <div className="space-y-1.5">
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Profil zawodowy
              </h2>
              <p
                className="leading-relaxed opacity-90"
                style={{ fontSize: `${fontSize * 0.9}px` }}
              >
                {summary}
              </p>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1 mb-2"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Doświadczenie
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: itemGap,
                }}
              >
                {experience.map((exp, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold leading-snug"
                        style={{ fontSize: `${fontSize * 0.9}px` }}
                      >
                        {exp.position}
                      </div>
                      {exp.company && (
                        <div
                          className="opacity-75"
                          style={{ fontSize: `${fontSize * 0.82}px` }}
                        >
                          {exp.company}
                        </div>
                      )}
                    </div>
                    <div
                      className="opacity-60 font-medium shrink-0 text-right whitespace-nowrap"
                      style={{ fontSize: `${fontSize * 0.82}px` }}
                    >
                      {exp.startDate}{" "}
                      {exp.startDate && (exp.endDate || "Obecnie") ? "—" : ""}{" "}
                      {exp.endDate || (exp.startDate ? "Obecnie" : "")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEKCYJNE WSPARCIE DLA PROJEKTÓW (JEŚLI SĄ) */}
          {projects && projects.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1 mb-2"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Projekty
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: `${spacing * 0.7}px`,
                }}
              >
                {projects.map((proj, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span
                        className="font-bold"
                        style={{ fontSize: `${fontSize * 0.9}px` }}
                      >
                        {proj.name}
                        {proj.role && (
                          <span
                            className="font-normal opacity-70"
                            style={{ fontSize: `${fontSize * 0.82}px` }}
                          >
                            {" "}
                            — {proj.role}
                          </span>
                        )}
                      </span>
                      {proj.url && (
                        <a
                          href={
                            proj.url.startsWith("http")
                              ? proj.url
                              : `https://${proj.url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="underline shrink-0 text-right"
                          style={{
                            color: primaryColor,
                            fontSize: `${fontSize * 0.82}px`,
                          }}
                        >
                          {proj.url.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                    {proj.technologies && (
                      <div
                        className="opacity-75 font-medium"
                        style={{ fontSize: `${fontSize * 0.78}px` }}
                      >
                        Stack: <span>{proj.technologies}</span>
                      </div>
                    )}
                    {proj.description && (
                      <div
                        className="opacity-90 prose prose-xs max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-0.5"
                        style={{ fontSize: `${fontSize * 0.85}px` }}
                        dangerouslySetInnerHTML={{ __html: proj.description }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1 mb-2"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Edukacja
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: itemGap,
                }}
              >
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold leading-snug break-words"
                        style={{ fontSize: `${fontSize * 0.9}px` }}
                      >
                        {edu.school}
                      </div>
                      {edu.degree && (
                        <div
                          className="opacity-75"
                          style={{ fontSize: `${fontSize * 0.82}px` }}
                        >
                          {edu.degree}
                        </div>
                      )}
                    </div>
                    <div
                      className="opacity-60 font-medium shrink-0 text-right whitespace-nowrap"
                      style={{ fontSize: `${fontSize * 0.82}px` }}
                    >
                      {edu.startDate}{" "}
                      {edu.startDate && (edu.endDate || "Obecnie") ? "—" : ""}{" "}
                      {edu.endDate || (edu.startDate ? "Obecnie" : "")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses && courses.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1 mb-1.5"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Kursy i certyfikaty
              </h2>
              <div className="space-y-1">
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-baseline gap-2"
                    style={{ fontSize: `${fontSize * 0.82}px` }}
                  >
                    <span className="font-medium leading-tight flex-1 break-words">
                      {course.name}
                    </span>
                    {course.date && (
                      <span className="opacity-60 shrink-0 text-right">
                        {course.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ZAINTERESOWANIA W GŁÓWNEJ (PRAWEJ) KOLUMNIE */}
          {interests && interests.length > 0 && (
            <div>
              <h2
                className="font-bold uppercase tracking-wider border-b pb-1 mb-2"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}30`,
                  fontSize: `${fontSize * 0.95}px`,
                }}
              >
                Zainteresowania
              </h2>
              <ul className="list-disc pl-4 space-y-1">
                {interests.map((item, index) => (
                  <li
                    key={index}
                    className="opacity-90 font-medium leading-snug"
                    style={{ fontSize: `${fontSize * 0.85}px` }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* KLAUZULA RODO */}
        <div
          className="pt-4 border-t border-zinc-200 dark:border-zinc-800 opacity-60 leading-tight"
          style={{ fontSize: `${fontSize * 0.68}px` }}
        >
          Wyrazam zgode na przetwarzanie moich danych osobowych dla potrzeb
          niezbednych do realizacji procesu rekrutacji zgodnie z Rozporzadzeniem
          Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016
          r. w sprawie ochrony osob fizycznych w zwiazku z przetwarzaniem danych
          osobowych i w sprawie swobodnego przeplywu takich danych oraz
          uchylenia dyrektywy 95/46/WE (RODO).
        </div>
      </div>
    </div>
  );
}
