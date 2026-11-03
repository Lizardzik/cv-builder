import { type TemplateProps, stripProtocol, toHref } from "./types";
import { RichText } from "@/components/RichText";
import { ProjectsSection } from "./ProjectsSection";

export function ModernTemplate({
  data,
  dimensions,
  colors,
  validLinks,
}: TemplateProps) {
  const { h1Size, subText, tinyText, sectionGap, itemGap, age } = dimensions;
  const { accent } = colors;
  const photo = data.personalInfo?.photo;

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div
          className="w-full text-white px-10 py-7 flex items-center justify-between shadow-sm"
          style={{ backgroundColor: accent }}
        >
          <div className="flex-1">
            <h1
              className="font-extrabold tracking-tight"
              style={{ fontSize: `${h1Size + 2}px` }}
            >
              {data.personalInfo?.firstName || "Imię"}{" "}
              {data.personalInfo?.lastName || "Nazwisko"}
            </h1>
            <p className="font-medium text-white/90 mt-1 uppercase tracking-wider text-xs">
              {data.personalInfo?.jobTitle || "Stanowisko docelowe"}
            </p>
            <div
              className="flex flex-wrap items-center text-white/85 mt-2.5 gap-x-3 gap-y-1"
              style={{ fontSize: `${subText}px` }}
            >
              {data.personalInfo?.email && (
                <a
                  href={`mailto:${data.personalInfo.email}`}
                  className="hover:underline"
                >
                  {data.personalInfo.email}
                </a>
              )}
              {data.personalInfo?.phone && (
                <span>• {data.personalInfo.phone}</span>
              )}
              {data.personalInfo?.city && (
                <span>• {data.personalInfo.city}</span>
              )}
              {data.personalInfo?.github && (
                <a
                  href={toHref(data.personalInfo.github)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  • {stripProtocol(data.personalInfo.github)}
                </a>
              )}
              {data.personalInfo?.linkedin && (
                <a
                  href={toHref(data.personalInfo.linkedin)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  • {stripProtocol(data.personalInfo.linkedin)}
                </a>
              )}
            </div>
            {validLinks.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/90 mt-1.5"
                style={{ fontSize: `${subText}px` }}
              >
                {validLinks.map((link, idx) => (
                  <span key={idx}>
                    {link.label && (
                      <strong className="font-semibold">{link.label}: </strong>
                    )}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-white/40 underline-offset-2"
                    >
                      {link.cleanUrl}
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>

          {photo && (
            <div className="flex flex-col items-center ml-6 shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-md">
                <img
                  src={photo}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              </div>
              {age !== null && (
                <span
                  className="mt-1 text-white/90 font-medium"
                  style={{ fontSize: `${tinyText}px` }}
                >
                  Wiek: {age} lat
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-10 flex flex-col" style={{ gap: `${sectionGap}px` }}>
          {data.summary && (
            <div
              className="p-4 rounded-lg border-l-4 leading-relaxed whitespace-pre-wrap text-justify"
              style={{
                borderColor: accent,
                backgroundColor: `${accent}0A`,
              }}
            >
              <p className="opacity-90 italic">{data.summary}</p>
            </div>
          )}

          {data.experience && data.experience.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Doświadczenie zawodowe
                </h2>
              </div>

              <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                {data.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="relative pl-3 border-l-2"
                    style={{ borderColor: `${accent}35` }}
                  >
                    <div className="flex justify-between items-baseline leading-tight">
                      <span className="font-bold text-sm">
                        {exp.position}{" "}
                        <span className="font-medium opacity-60">
                          | {exp.company}
                        </span>
                      </span>
                      <span className="font-medium whitespace-nowrap text-xs opacity-60 tabular-nums">
                        {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ""}
                      </span>
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
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Projekty
                </h2>
              </div>
              <ProjectsSection
                projects={data.projects}
                accent={accent}
                subText={subText}
                itemGap={itemGap}
                variant="bordered"
              />
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Edukacja
                </h2>
              </div>

              <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                {data.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-baseline pl-3 border-l-2"
                    style={{ borderColor: `${accent}35` }}
                  >
                    <div>
                      <div className="font-bold text-sm leading-tight">
                        {edu.school}
                      </div>
                      <div
                        className="opacity-70 mt-0.5"
                        style={{ fontSize: `${subText}px` }}
                      >
                        {edu.degree}
                      </div>
                    </div>
                    <span className="font-medium text-xs opacity-60 tabular-nums">
                      {edu.startDate} {edu.endDate ? `— ${edu.endDate}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-8">
            {data.skills && data.skills.length > 0 && (
              <div
                className={
                  data.languages && data.languages.length > 0
                    ? "col-span-7"
                    : "col-span-12"
                }
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <h2
                    className="font-bold uppercase tracking-wider text-xs"
                    style={{ color: accent }}
                  >
                    Umiejętności
                  </h2>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill, index) =>
                    skill.name ? (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-md font-medium text-xs border"
                        style={{
                          backgroundColor: `${accent}10`,
                          borderColor: `${accent}30`,
                          color: accent,
                        }}
                      >
                        {skill.name}
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {data.languages && data.languages.length > 0 && (
              <div className="col-span-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <h2
                    className="font-bold uppercase tracking-wider text-xs"
                    style={{ color: accent }}
                  >
                    Języki obce
                  </h2>
                </div>

                <div className="flex flex-col gap-1.5">
                  {data.languages.map((lang, index) =>
                    lang.name ? (
                      <div
                        key={index}
                        className="flex justify-between items-center px-2.5 py-1 rounded border border-current/10 bg-current/[0.02]"
                        style={{ fontSize: `${subText}px` }}
                      >
                        <span className="font-medium opacity-90">
                          {lang.name}
                        </span>
                        <span
                          className="font-bold text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${accent}15`,
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
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h2
                  className="font-bold uppercase tracking-wider text-xs"
                  style={{ color: accent }}
                >
                  Kursy i certyfikaty
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-3">
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
                        <span className="text-xs opacity-60 tabular-nums">
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
      </div>

      {data.clause && (
        <div className="px-10 pb-8 mt-auto">
          <div
            className="opacity-50 text-justify border-t border-current/15 pt-2 leading-tight"
            style={{ fontSize: `${tinyText}px` }}
          >
            {data.clause}
          </div>
        </div>
      )}
    </div>
  );
}
