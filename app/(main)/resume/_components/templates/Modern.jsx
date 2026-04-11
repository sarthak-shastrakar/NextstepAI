"use client";

import { parseBulletPoints } from "@/app/form-lib/helper";
import { Mail, Phone, Linkedin, Github, MapPin } from "lucide-react";

export default function ModernTemplate({ values, user }) {
  const { contactInfo, summary, skills, experience, education, projects } = values;

  const SectionTitle = ({ children }) => (
    <h2 className="text-[11pt] font-bold text-primary uppercase tracking-normal border-b border-primary/20 pb-1 mb-4">
      {children}
    </h2>
  );

  return (
    <div className="bg-white w-full min-h-[297mm] text-slate-800 font-sans leading-normal grid grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <div className="bg-slate-50/50 p-8 border-r border-slate-100">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-[20pt] font-bold text-slate-900 leading-tight mb-1">
            {user?.fullName}
          </h1>
          <p className="text-[9pt] font-semibold text-primary uppercase tracking-wider">
            {user?.industry || "Professional"}
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider mb-4">Contact</h3>
            <div className="space-y-3 text-[9pt] text-slate-600">
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate group-hover:underline underline-offset-2">{contactInfo.email}</span>
                </a>
              )}
              {contactInfo?.mobile && (
                <a href={`tel:${contactInfo.mobile}`} className="flex items-center gap-3 hover:text-primary transition-colors group">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="group-hover:underline underline-offset-2">{contactInfo.mobile}</span>
                </a>
              )}
              {contactInfo?.linkedin && (
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                  <Linkedin className="h-4 w-4 text-primary shrink-0" />
                  <span className="group-hover:underline underline-offset-2">LinkedIn</span>
                </a>
              )}
              {contactInfo?.github && (
                <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                  <Github className="h-4 w-4 text-primary shrink-0" />
                  <span className="group-hover:underline underline-offset-2">GitHub</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider mb-4">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills?.split(",").map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[8.5pt] font-medium text-slate-700 shadow-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          {education?.length > 0 && (
            <div>
              <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider mb-4">Education</h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-[9pt] font-bold text-slate-800 leading-tight">{edu.title}</p>
                    <p className="text-[8.5pt] text-slate-600 italic">{edu.organization}</p>
                    <p className="text-[8pt] text-slate-400 font-bold mt-0.5">{edu.endDate || edu.startDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-10 bg-white">
        {summary && (
          <div className="mb-10">
            <SectionTitle>About Me</SectionTitle>
            <p className="text-[10pt] text-slate-600 text-justify leading-relaxed italic border-l-4 border-primary/10 pl-4 py-1">
              {summary}
            </p>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="mb-10">
            <SectionTitle>Work Experience</SectionTitle>
            <div className="space-y-8">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l border-slate-200 last:border-0 pb-4">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[10.5pt] font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-[8.5pt] font-medium text-slate-500">
                      {exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}
                    </span>
                  </div>
                  <div className="text-[9.5pt] font-semibold text-slate-700 mb-2">{exp.organization}</div>
                  <ul className="list-disc ml-5 space-y-1.5">
                    {parseBulletPoints(exp.description).map((point, idx) => (
                      <li key={idx} className="text-[9pt] text-slate-600 leading-normal pl-1">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div>
            <SectionTitle>Key Projects</SectionTitle>
            <div className="space-y-6">
              {projects.map((proj, i) => (
                <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-[10pt] font-black text-slate-900">
                         {proj.link ? (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline decoration-primary/30">
                              {proj.title}
                            </a>
                         ) : (
                            proj.title
                         )}
                    </h3>
                    <span className="text-[8.5pt] font-bold text-slate-400">{proj.endDate || proj.startDate}</span>
                  </div>
                  <ul className="list-disc ml-4 space-y-1">
                    {parseBulletPoints(proj.description).map((point, idx) => (
                      <li key={idx} className="text-[9pt] text-slate-600 leading-normal pl-1">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
