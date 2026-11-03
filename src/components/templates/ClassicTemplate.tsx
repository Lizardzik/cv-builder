import { type TemplateProps, stripProtocol, toHref } from "./types";
import { RichText } from "@/components/RichText";
import { ProjectsSection } from "./ProjectsSection";

export function ClassicTemplate({
  data,
  dimensions,
  colors,
  validLinks,
}: TemplateProps) {
  const { h1Size, subText, tinyText, sectionGap, itemGap, age } = dimensions;
  const { accent } = colors;
  const photo = data.personalInfo?.photo;

  const contactItems = [
    data.personalInfo?.email && {
      text: data.personalInfo.email,
      href: `mailto:${data.personalInfo.email}`,
    },
    data.personalInfo?.phone && {
      text: data.personalInfo.phone,
    },
    data.personalInfo?.city && {
      text: [data.personalInfo.postalCode, data.personalInfo.city]
        .filter(Boolean)
        .join(" "),
    },
    data.personalInfo?.github && {
      text: stripProtocol(data.personalInfo.github),
      href: toHref(data.personalInfo.github),
    },
    data.personalInfo?.linkedin && {
      text: stripProtocol(data.personalInfo.linkedin),
      href: toHref(data.personalInfo.linkedin),
    },
  ].filter(Boolean) as { text: string; href?: string }[];

  return (
    <div className="flex flex-col justify-between h-full p-12">
      <div className="flex flex-col" style={{ gap: `${sectionGap * 1.05}px` }}>
        <div className="flex justify-between items-start pb-5 border-b border-current/20">
          <div className="flex-1">
            <h1
              className="font-bold tracking-tight leading-none"
              style={{ fontSize: `${h1Size * 1.1}px` }}
            >
              {data.personalInfo?.firstName || "Imię"}{" "}
              <span style={{ color: accent }}>
                {data.personalInfo?.lastName || "Nazwisko"}
              </span>
            </h1>
            <p className="font-medium mt-2 tracking-wide uppercase text-xs opacity-75">
              {data.personalInfo?.jobTitle || "Stanowisko docelowe"}
            </p>

            {contactItems.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-3 font-normal opacity-80"
                style={{ fontSize: `${subText}px` }}
              >
                {contactItems.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2.5">
                    {idx > 0 && <span className="opacity-40">•</span>}
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span>{item.text}</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {validLinks.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 opacity-90"
                style={{ fontSize: `${subText}px` }}
              >
                {validLinks.map((link, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1">
                    {link.label && (
                      <span className="font-semibold">{link.label}:</span>
                    )}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-current/30 underline-offset-2"
                    >
                      {link.cleanUrl}
                    </a>
                    {idx < validLinks.length - 1 && (
                      <span className="opacity-40 ml-2">/</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {photo && (
            <div className="flex flex-col items-center ml-6 shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-sm border-2 border-current/20">
                <img
                  src={photo}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              </div>
              {age !== null && (
                <span className="mt-1 opacity-60 font-medium text-[11px]">
                  {age} lat
                </span>
              )}
            </div>
          )}
        </div>

        {data.summary && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: accent }}
              >
                Podsumowanie zawodowe
              </h2>
              <div className="h-px bg-current/20 flex-1" />
            </div>
            <p className="leading-relaxed whitespace-pre-wrap text-justify opacity-90">
              {data.summary}
            </p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: accent }}
              >
                Doświadczenie zawodowe
              </h2>
              <div className="h-px bg-current/20 flex-1" />
            </div>

            <div
              className="flex flex-col"
              style={{ gap: `${itemGap * 1.1}px` }}
            >
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline leading-tight">
                    <span className="font-bold text-sm">{exp.position}</span>
                    <span className="font-medium whitespace-nowrap text-xs tabular-nums opacity-60">
                      {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ""}
                    </span>
                  </div>
                  <div className="text-xs font-medium mt-0.5 opacity-75">
                    {exp.company}
                  </div>
                  {exp.description && (
                    <RichText
                      html={exp.description}
                      className="leading-relaxed mt-1.5 opacity-85"
                      style={{ fontSize: `${subText}px` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: accent }}
              >
                Projekty
              </h2>
              <div className="h-px bg-current/20 flex-1" />
            </div>
            <ProjectsSection
              projects={data.projects}
              accent={accent}
              subText={subText}
              itemGap={itemGap}
            />
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <h2
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: accent }}
              >
                Edukacja
              </h2>
              <div className="h-px bg-current/20 flex-1" />
            </div>

            <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline leading-tight">
                    <span className="font-bold text-sm">{edu.school}</span>
                    <span className="text-xs tabular-nums font-medium opacity-60">
                      {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ""}
                    </span>
                  </div>
                  <div
                    className="mt-0.5 opacity-75"
                    style={{ fontSize: `${subText}px` }}
                  >
                    {edu.degree}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 pt-1">
          {data.skills && data.skills.length > 0 && (
            <div
              className={
                data.languages && data.languages.length > 0
                  ? "col-span-8"
                  : "col-span-12"
              }
            >
              <div className="flex items-center gap-3 mb-2.5">
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Kluczowe kompetencje
                </h2>
                <div className="h-px bg-current/20 flex-1" />
              </div>
              <div
                className={`grid gap-x-6 gap-y-1.5 ${
                  data.skills.length > 5 ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {data.skills.map((skill, index) =>
                  skill.name ? (
                    <div
                      key={index}
                      className="leading-snug flex items-center gap-2 opacity-90"
                      style={{ fontSize: `${subText}px` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <span>{skill.name}</span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {data.languages && data.languages.length > 0 && (
            <div className="col-span-4">
              <div className="flex items-center gap-3 mb-2.5">
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Języki obce
                </h2>
                <div className="h-px bg-current/20 flex-1" />
              </div>
              <div className="flex flex-col gap-1.5">
                {data.languages.map((lang, index) =>
                  lang.name ? (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                      style={{ fontSize: `${subText}px` }}
                    >
                      <span className="font-medium opacity-90">
                        {lang.name}
                      </span>
                      <span
                        className="font-semibold text-xs px-2 py-0.5 rounded border shrink-0 inline-block text-center min-w-[34px]"
                        style={{
                          backgroundColor: `${accent}12`,
                          borderColor: `${accent}30`,
                          color: accent,
                        }}
                      >
                        {lang.level}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>

        {data.courses && data.courses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: accent }}
              >
                Kursy i certyfikaty
              </h2>
              <div className="h-px bg-current/20 flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {data.courses.map((course, index) =>
                course.name ? (
                  <div
                    key={index}
                    className="flex justify-between items-baseline"
                    style={{ fontSize: `${subText}px` }}
                  >
                    <span className="font-medium opacity-90">
                      {course.name}
                    </span>
                    {course.date && (
                      <span className="text-xs opacity-60 tabular-nums ml-2">
                        {course.date}
                      </span>
                    )}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </div>

      {data.clause && (
        <div
          className="text-justify border-t border-current/20 pt-3 mt-4 leading-tight opacity-50"
          style={{ fontSize: `${tinyText}px` }}
        >
          {data.clause}
        </div>
      )}
    </div>
  );
}
