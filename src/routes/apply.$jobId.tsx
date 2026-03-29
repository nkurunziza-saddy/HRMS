import {
  ArrowLeft01Icon,
  Briefcase02Icon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Clock02Icon,
  FileUploadIcon,
  Location01Icon,
  Mail01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameContent,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateApplicantMutation } from "@/lib/redux/api/applicant";
import { useGetJobPostingQuery } from "@/lib/redux/api/job-posting";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/apply/$jobId")({
  component: ApplyForJobPage,
});

function ApplyForJobPage() {
  const { jobId } = Route.useParams();
  const { data: job, isLoading, isError } = useGetJobPostingQuery(jobId);
  const [createApplicant] = useCreateApplicantMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentNumber: "",
    gender: "MALE" as "MALE" | "FEMALE",
    coverLetter: "",
    resume: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.documentNumber
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.resume) {
      toast.error("Please upload your Resume / CV");
      return;
    }

    setIsSubmitting(true);
    try {
      if (job) {
        const data = new FormData();
        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("email", formData.email);
        data.append("phoneNumber", formData.phone);
        data.append("jobPostId", jobId);
        data.append("documentNumber", formData.documentNumber);
        data.append("gender", formData.gender);
        if (formData.coverLetter)
          data.append("coverLetter", formData.coverLetter);
        data.append("cv", formData.resume);

        await createApplicant(data).unwrap();
      }

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">
          Loading Position...
        </p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-muted/50 text-muted-foreground rounded-2xl flex items-center justify-center mb-6">
          <HugeiconsIcon icon={Briefcase02Icon} size={24} />
        </div>
        <h1 className="text-xl font-bold mb-2">Job Opening Unavailable</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          This position may have been filled or the application window has
          closed.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Return to Careers
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          Application Submitted
        </h1>
        <p className="text-muted-foreground text-sm mb-10 max-w-sm leading-relaxed">
          Your application for{" "}
          <span className="font-semibold text-foreground">{job.title}</span> has
          been successfully transmitted to our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Return Home
          </Button>
          <Button onClick={() => setIsSuccess(false)}>Apply for Another</Button>
        </div>
      </div>
    );
  }

  const details = [
    {
      label: "Location",
      value: job.location,
      icon: Location01Icon,
    },
    {
      label: "Work Mode",
      value: job.workMode,
      icon: Clock02Icon,
    },
    {
      label: "Deadline",
      value: new Date(job.applicationDeadline).toLocaleDateString(),
      icon: Calendar01Icon,
    },
    {
      label: "Status",
      value: job.status,
      icon: Briefcase02Icon,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="size-7" />
            <span className="text-sm font-bold tracking-tight uppercase">
              HRMS Careers
            </span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-xs font-semibold gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            Back
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          <Frame>
            <FramePanel className="bg-card">
              <FrameHeader className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                      Job Details
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {job.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <FrameTitle className="text-2xl sm:text-3xl tracking-tight">
                      {job.title}
                    </FrameTitle>
                    <FrameDescription className="text-sm sm:text-base">
                      Review the role summary before submitting your
                      application.
                    </FrameDescription>
                  </div>
                </div>
              </FrameHeader>

              <FrameContent className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-9 w-9 rounded-xl bg-background border border-border/60 flex items-center justify-center shrink-0">
                          <HugeiconsIcon
                            icon={item.icon}
                            size={16}
                            className="text-muted-foreground"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {job.aboutRole && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                      About the role
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {job.aboutRole}
                    </p>
                  </section>
                )}

                {job.mission && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                      Mission
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {job.mission}
                    </p>
                  </section>
                )}

                {job.sections && job.sections.length > 0 && (
                  <div className="space-y-6">
                    {job.sections.map((section) => (
                      <section key={section.id} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                          {section.title}
                        </h3>

                        {section.items && section.items.length > 0 && (
                          <ul className="space-y-2">
                            {section.items.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                              >
                                <span className="mt-2 size-1.5 rounded-full bg-primary/40 shrink-0" />
                                {item.content}
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))}
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                      Skills
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                            skill.isRequired
                              ? "border-primary/20 bg-primary/5 text-primary"
                              : "border-border/60 bg-muted/30 text-muted-foreground",
                          )}
                        >
                          {skill.name}
                          {skill.isRequired && (
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-70">
                              Required
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </FrameContent>
            </FramePanel>
          </Frame>

          <Frame>
            <FramePanel className="bg-card">
              <form id="application-form" onSubmit={handleSubmit}>
                <FrameHeader className="space-y-2">
                  <FrameTitle className="text-xl sm:text-2xl tracking-tight">
                    Apply Now
                  </FrameTitle>
                  <FrameDescription>
                    Complete the form below and upload your CV.
                  </FrameDescription>
                </FrameHeader>

                <FrameContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-xs font-semibold"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        className="h-11 rounded-xl bg-muted/20 border-border/60 focus:bg-background"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-xs font-semibold"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Mugisha"
                        className="h-11 rounded-xl bg-muted/20 border-border/60 focus:bg-background"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-xs font-semibold flex items-center gap-2"
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={14} />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className="h-11 rounded-xl bg-muted/20 border-border/60 focus:bg-background"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-xs font-semibold flex items-center gap-2"
                      >
                        <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250..."
                        className="h-11 rounded-xl bg-muted/20 border-border/60 focus:bg-background"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="documentNumber"
                        className="text-xs font-semibold"
                      >
                        ID / Document Number
                      </Label>
                      <Input
                        id="documentNumber"
                        placeholder="11990..."
                        className="h-11 rounded-xl bg-muted/20 border-border/60 focus:bg-background"
                        value={formData.documentNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            documentNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-semibold">
                        Gender
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            gender: val as "MALE" | "FEMALE",
                          })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-border/60">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="coverLetter"
                      className="text-xs font-semibold"
                    >
                      Cover Letter{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us about yourself..."
                      className="min-h-[140px] rounded-2xl bg-muted/20 border-border/60 focus:bg-background resize-none"
                      value={formData.coverLetter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coverLetter: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-2">
                      <HugeiconsIcon icon={FileUploadIcon} size={14} />
                      Resume / CV
                    </Label>

                    <div className="relative">
                      <input
                        type="file"
                        id="resume"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resume: e.target.files?.[0] || null,
                          })
                        }
                      />

                      <div
                        className={cn(
                          "min-h-28 rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center gap-2 transition-colors",
                          formData.resume
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 bg-muted/10 hover:border-primary/35 hover:bg-muted/20",
                        )}
                      >
                        <HugeiconsIcon
                          icon={
                            formData.resume
                              ? CheckmarkCircle01Icon
                              : FileUploadIcon
                          }
                          size={20}
                          className={
                            formData.resume
                              ? "text-primary"
                              : "text-muted-foreground/50"
                          }
                        />
                        <p className="text-sm font-medium">
                          {formData.resume
                            ? formData.resume.name
                            : "Click to upload your CV"}
                        </p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                          PDF, DOC, or DOCX up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </FrameContent>

                <FrameFooter className="border-t border-border/60 p-4 sm:p-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </FrameFooter>
              </form>
            </FramePanel>
          </Frame>
        </div>
      </main>

      <footer className="py-10 border-t border-border bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            &copy; 2024 HRMS Infrastructure • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
