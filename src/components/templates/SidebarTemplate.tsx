import { type TemplateProps, stripProtocol, toHref } from "./types";
import { RichText } from "@/components/RichText";
import { ProjectsSection } from "./ProjectsSection";

export function SidebarTemplate({
  data,
  dimensions,
  colors,
  validLinks,
}: TemplateProps) {
  const { h3Size, subText, tinyText, sectionGap, itemGap, age } = dimensions;
  const { accent } = colors;
  const photo = data.personalInfo?.photo;

  return (
    <div className="flex h-full">
      <div
        className="w-[32%] p-8 text-white flex flex-col justify-between shrink-0 shadow-lg"
        style={{ backgroundColor: accent }}
      >
        <div className="flex flex-col gap-6">
          {photo && (
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md">
                <img
                  src={photo}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              </div>
              {age !== null && (
                <span
                  className="mt-2 text-white/80 font-medium"
                  style={{ fontSize: `${tinyText}px` }}
                >
                  {age} lat
                </span>
              )}
            </div>
          )}

          <div>
            <h2
              className="font-bold leading-tight text-white"
              style={{ fontSize: `${h3Size + 4}px` }}
            >
              {data.personalInfo?.firstName} <br />
              {data.personalInfo?.lastName}
            </h2>
            <p
              className="font-medium text-white/80 mt-1 leading-snug"
              style={{ fontSize: `${subText}px` }}
            >
              {data.personalInfo?.jobTitle}
            </p>
          </div>

          <div
            className="flex flex-col gap-1.5 border-t border-white/20 pt-4 text-white/90"
            style={{ fontSize: `${subText}px` }}
          >
            <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-0.5">
              Kontakt
            </span>
            {data.personalInfo?.email && (
              <a
                href={`mailto:${data.personalInfo.email}`}
                className="break-all hover:underline"
              >
                {data.personalInfo.email}
              </a>
            )}
            {data.personalInfo?.phone && <div>{data.personalInfo.phone}</div>}
            {data.personalInfo?.city && <div>{data.personalInfo.city}</div>}
            {data.personalInfo?.github && (
              <a
                href={toHref(data.personalInfo.github)}
                target="_blank"
                rel="noreferrer"
                className="break-all text-white/85 hover:underline"
              >
                {stripProtocol(data.personalInfo.github)}
              </a>
            )}
            {data.personalInfo?.linkedin && (
              <a
                href={toHref(data.personalInfo.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="break-all text-white/85 hover:underline"
              >
                {stripProtocol(data.personalInfo.linkedin)}
              </a>
            )}
            {validLinks.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 border-t border-white/10 pt-2">
                {validLinks.map((link, idx) => (
                  <div key={idx} className="break-all text-xs text-white/85">
                    {link.label && (
                      <span className="text-white font-medium">
                        {link.label}:{" "}
                      </span>
                    )}
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-white/30"
                    >
                      {link.cleanUrl}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.skills && data.skills.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-2 block">
                Umiejętności
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, index) =>
                  skill.name ? (
                    <span
                      key={index}
                      className="px-2 py-0.5 rounded bg-white/15 text-white text-xs font-medium"
                    >
                      {skill.name}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {data.languages && data.languages.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-2 block">
                Języki
              </span>
              <div className="flex flex-col gap-1.5">
                {data.languages.map((lang, index) =>
                  lang.name ? (
                    <div
                      key={index}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-white/90">{lang.name}</span>
                      <span className="font-bold text-white/80">
                        {lang.level}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-[68%] p-8 flex flex-col justify-between">
        <div className="flex flex-col" style={{ gap: `${sectionGap}px` }}>
          {data.summary && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider mb-2"
                style={{ color: accent, fontSize: `${h3Size}px` }}
              >
                Profil zawodowy
              </h3>
              <p className="leading-relaxed whitespace-pre-wrap opacity-90">
                {data.summary}
              </p>
            </div>
          )}

          {data.experience && data.experience.length > 0 && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider mb-3 pb-1 border-b border-current/15"
                style={{ color: accent, fontSize: `${h3Size}px` }}
              >
                Doświadczenie zawodowe
              </h3>
              <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start font-bold leading-tight">
                      <span>{exp.position}</span>
                      <span
                        className="font-semibold whitespace-nowrap tabular-nums"
                        style={{ color: accent, fontSize: `${subText}px` }}
                      >
                        {exp.startDate} {exp.endDate ? ` — ${exp.endDate}` : ""}
                      </span>
                    </div>
                    <div
                      className="opacity-70 mt-0.5"
                      style={{ fontSize: `${subText}px` }}
                    >
                      {exp.company}
                    </div>
                    {exp.description && (
                      <RichText
                        html={exp.description}
                        className="leading-relaxed mt-1 opacity-80"
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
              <h3
                className="font-bold uppercase tracking-wider mb-3 pb-1 border-b border-current/15"
                style={{ color: accent, fontSize: `${h3Size}px` }}
              >
                Projekty
              </h3>
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
              <h3
                className="font-bold uppercase tracking-wider mb-3 pb-1 border-b border-current/15"
                style={{ color: accent, fontSize: `${h3Size}px` }}
              >
                Edukacja
              </h3>
              <div className="flex flex-col" style={{ gap: `${itemGap}px` }}>
                {data.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <div className="font-bold leading-tight">
                        {edu.school}
                      </div>
                      <div
                        className="opacity-70 mt-0.5"
                        style={{ fontSize: `${subText}px` }}
                      >
                        {edu.degree}
                      </div>
                    </div>
                    <div
                      className="font-semibold whitespace-nowrap opacity-60 tabular-nums"
                      style={{ fontSize: `${subText}px` }}
                    >
                      {edu.startDate} {edu.endDate ? ` — ${edu.endDate}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.courses && data.courses.length > 0 && (
            <div>
              <h3
                className="font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-current/15"
                style={{ color: accent, fontSize: `${h3Size}px` }}
              >
                Kursy i certyfikaty
              </h3>
              <div className="flex flex-col gap-1">
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

        {data.clause && (
          <div
            className="opacity-50 text-justify border-t border-current/15 pt-2 mt-4 leading-tight"
            style={{ fontSize: `${tinyText}px` }}
          >
            {data.clause}
          </div>
        )}
      </div>
    </div>
  );
}
