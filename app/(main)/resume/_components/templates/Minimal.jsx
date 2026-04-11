"use client";

import { parseBulletPoints } from "@/app/form-lib/helper";

export default function MinimalTemplate({ values, user }) {
  const { contactInfo, summary, skills, experience, education, projects } = values;

  const Section = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
      <h2 className="text-[11pt] font-black uppercase tracking-[0.1em] text-slate-900 border-b border-slate-300 pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );

  const Entry = ({ title, org, date, details, link }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-[10pt] font-black text-slate-900">
             {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-slate-300">
                  {title}
                </a>
             ) : (
                title
             )}
        </h3>
        <span className="text-[9pt] font-bold text-slate-500 whitespace-nowrap ml-4">{date}</span>
      </div>
      <div className="text-[9.5pt] font-bold text-slate-700 italic mb-2 tracking-tight">{org}</div>
      <ul className="list-disc ml-5 space-y-1">
        {parseBulletPoints(details).map((point, i) => (
          <li key={i} className="text-[9pt] text-slate-600 leading-normal pl-1">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-white p-[0.75in] w-full min-h-[297mm] text-slate-800 font-sans leading-normal">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-[28pt] font-black text-slate-950 tracking-tighter leading-none mb-3">
          {user?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9pt] font-bold text-slate-500 uppercase tracking-widest">
          {contactInfo?.email && (
            <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors underline decoration-slate-300">
                {contactInfo.email}
            </a>
          )}
          {contactInfo?.mobile && (
            <a href={`tel:${contactInfo.mobile}`} className="hover:text-primary transition-colors">
                • {contactInfo.mobile}
            </a>
          )}
          {contactInfo?.linkedin && (
             <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-slate-300">
                • LinkedIn
            </a>
          )}
          {contactInfo?.github && (
            <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-slate-300">
                • GitHub
            </a>
          )}
        </div>
      </div>

      {summary && (
        <Section title="Professional Summary">
          <p className="text-[9.5pt] text-slate-600 leading-[1.6] text-justify">{summary}</p>
        </Section>
      )}

      {skills && (
        <Section title="Core Competencies">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {skills.split(",").map((skill, i) => (
              <div key={i} className="flex items-center gap-2 text-[9pt] font-bold text-slate-700">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {skill.trim()}
              </div>
            ))}
          </div>
        </Section>
      )}

      {experience?.length > 0 && (
        <Section title="Professional Experience">
          {experience.map((exp, i) => (
            <Entry
              key={i}
              title={exp.title}
              org={exp.organization}
              date={exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}
              details={exp.description}
              link={exp.link}
            />
          ))}
        </Section>
      )}

      {projects?.length > 0 && (
        <Section title="Technical Projects">
          {projects.map((proj, i) => (
            <Entry
              key={i}
              title={proj.title}
              org={proj.organization}
              date={proj.endDate || proj.startDate}
              details={proj.description}
              link={proj.link}
            />
          ))}
        </Section>
      )}

      {education?.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
               <div className="flex justify-between items-baseline">
                <h3 className="text-[10pt] font-black text-slate-900">{edu.title}</h3>
                <span className="text-[9pt] font-bold text-slate-500 whitespace-nowrap ml-4">{edu.endDate || edu.startDate}</span>
              </div>
              <div className="text-[9.5pt] font-bold text-slate-700 italic tracking-tight">{edu.organization}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
