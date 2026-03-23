"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X, Loader2, ArrowDown, Check } from "lucide-react";
import dynamic from "next/dynamic";

const MarbleInk = dynamic(() => import("@/components/ui/marble-ink"), {
  ssr: false,
});

// ─── Schema ───────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const photoSchema = z
  .custom<File>()
  .refine((f) => f instanceof File, "Please upload a file")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Max 10 MB per photo")
  .refine((f) => ACCEPTED_TYPES.includes(f.type), "JPG, PNG, WebP, or HEIC only");

const applicationSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  age: z
    .string()
    .min(1, "Required")
    .refine((v) => /^\d+$/.test(v), "Enter a number")
    .refine((v) => Number(v) >= 14, "Minimum age is 14")
    .refine((v) => Number(v) <= 35, "Maximum age is 35"),
  height: z
    .string()
    .min(1, "Required")
    .refine((v) => /^\d+$/.test(v), "Enter a number")
    .refine((v) => Number(v) >= 170, "Minimum 170 cm"),
  location: z.string().min(1, "Required"),
  consent: z.literal(true, { error: "You must agree to continue" }),
});

type ApplicationData = z.infer<typeof applicationSchema>;

// ─── Photo slots ──────────────────────────────────────────

interface PhotoSlot {
  label: string;
  file: File | null;
  preview: string | null;
  error: string | null;
}

const PHOTO_SLOTS: { label: string }[] = [
  { label: "Face" },
  { label: "Profile" },
  { label: "Full body" },
];

// ─── Component ────────────────────────────────────────────

export function ScoutingPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    mode: "onBlur",
  });

  const [photos, setPhotos] = useState<PhotoSlot[]>(
    PHOTO_SLOTS.map((s) => ({ ...s, file: null, preview: null, error: null }))
  );
  const [photoError, setPhotoError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhoto = useCallback((index: number, file: File | null) => {
    if (!file) return;
    const result = photoSchema.safeParse(file);
    if (!result.success) {
      setPhotos((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, error: result.error.issues[0].message } : p
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotos((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, file, preview: e.target?.result as string, error: null }
            : p
        )
      );
      setPhotoError("");
    };
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, file: null, preview: null, error: null } : p
      )
    );
    if (fileRefs.current[index]) fileRefs.current[index]!.value = "";
  }, []);

  async function onSubmit(data: ApplicationData) {
    setSubmitError("");
    const uploadedPhotos = photos.filter((p) => p.file);
    if (uploadedPhotos.length === 0) {
      setPhotoError("Upload at least one photo.");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && key !== "consent") {
        formData.append(key, String(val));
      }
    });
    photos.forEach((p, i) => {
      if (p.file) formData.append(`photo_${i}`, p.file);
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setSubmitError("Request timed out. Please check your connection and try again.");
      } else {
        setSubmitError("Something went wrong. Please try again or email us directly.");
      }
    }
  }

  // ─── Main layout ────────────────────────────────────────

  return (
    <div className="relative min-h-svh lg:flex">
      {/* ── Left: Brand ── */}
      <div className="relative flex flex-col lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0">
        {/* Shader background */}
        <div className="absolute inset-0 bg-background">
          <MarbleInk speed={0.8} className="h-full w-full" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-16 sm:px-12 lg:px-20">
          {/* Logo */}
          <p className="mb-12 text-xs font-bold uppercase tracking-[0.25em] text-black/70 lg:mb-14">
            scouting agency
          </p>

          {/* Headline */}
          <h1 className="max-w-lg text-3xl font-bold uppercase leading-[1.1] tracking-tight text-black sm:text-4xl lg:text-5xl">
            We&apos;re looking for
            <br />
            the next face.
          </h1>
          <p className="mt-6 text-xs leading-relaxed text-black/55">
            We discover raw, striking, unforgettable girls
            <br />
            and place them with leading agencies worldwide.
          </p>
          <div className="mt-4 max-w-md space-y-4">
            <p className="text-xs leading-relaxed text-black/40">
              We work with international model management companies with
              headquarters in Los Angeles and five additional offices across
              Europe.
            </p>
            <p className="text-xs leading-relaxed text-black/40">
              Our talents collaborate with leading fashion houses and
              publications such as Prada, Louis Vuitton, Armani, Miu Miu,
              Maison Margiela, Tiffany, Dazed, Vogue, and many more.
            </p>
          </div>

          {/* Key requirements */}
          <div className="mt-12 flex gap-10 lg:mt-14">
            <div>
              <p className="text-xs font-medium text-black/85">14 – 35</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-black/40">Age</p>
            </div>
            <div>
              <p className="text-xs font-medium text-black/85">170 cm+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-black/40">Height</p>
            </div>
            <div>
              <p className="text-xs font-medium text-black/85">New Faces</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-black/40">Experience</p>
            </div>
          </div>
        </div>

        {/* Mobile scroll indicator */}
        <div className="flex flex-col items-center pb-6 lg:hidden">
          <a href="#apply" className="flex flex-col items-center gap-1 text-black/40">
            <span className="text-xs font-medium uppercase tracking-[0.1em]">Apply</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>

      </div>

      {/* ── Right: Form ── */}
      <div id="apply" className="lg:ml-[50%] lg:min-h-svh">
        <div className="flex lg:min-h-svh flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto flex w-full max-w-md flex-col items-center"
            >
              <div className="mb-5 flex h-8 w-8 items-center justify-center border border-foreground">
                <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.15em]">
                Application received
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                We&apos;ll be in touch if there&apos;s a match.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSubmitError("");
                  setPhotoError("");
                  setPhotos(PHOTO_SLOTS.map((s) => ({ ...s, file: null, preview: null, error: null })));
                  reset();
                }}
                className="mt-6 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Submit another
              </button>
            </motion.div>
          ) : (
          <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-md space-y-5"
            noValidate
          >
            {/* Photos */}
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Photos <span className="text-foreground/30">*</span>
              </p>
              <p className="mb-2.5 text-xs text-muted-foreground">
                Natural light, no makeup, hair down, no filters.
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {photos.map((photo, i) => (
                  <div key={i}>
                    <AnimatePresence mode="wait">
                      {photo.preview ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group relative aspect-[3/4] overflow-hidden border border-border"
                        >
                          <img
                            src={photo.preview}
                            alt={photo.label}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label={`Remove ${photo.label} photo`}
                            className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          type="button"
                          onClick={() => fileRefs.current[i]?.click()}
                          className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 border border-dashed transition-colors hover:border-foreground/30 ${
                            photo.error ? "border-red-400/50" : "border-border"
                          }`}
                        >
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            {photo.label}
                          </span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                    {photo.error && (
                      <p className="mt-1 text-xs text-red-400">{photo.error}</p>
                    )}
                    <input
                      ref={(el) => { fileRefs.current[i] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      className="hidden"
                      onChange={(e) => handlePhoto(i, e.target.files?.[0] || null)}
                    />
                  </div>
                ))}
              </div>
              {photoError && (
                <p className="mt-2 text-xs text-red-400">{photoError}</p>
              )}
            </div>

            {/* Name + Age */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" required error={errors.name?.message}>
                <input
                  {...register("name")}
                  className={fieldClass(errors.name)}
                  autoComplete="name"
                  aria-required="true"
                />
              </Field>
              <Field label="Age" required error={errors.age?.message}>
                <input
                  {...register("age")}
                  type="number"
                  inputMode="numeric"
                  className={fieldClass(errors.age)}
                  aria-required="true"
                />
              </Field>
            </div>

            {/* Height + Location */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (cm)" required error={errors.height?.message}>
                <input
                  {...register("height")}
                  type="number"
                  inputMode="numeric"
                  className={fieldClass(errors.height)}
                  aria-required="true"
                />
              </Field>
              <Field label="City, Country" required error={errors.location?.message}>
                <input
                  {...register("location")}
                  placeholder="Budapest, Hungary"
                  className={fieldClass(errors.location)}
                  aria-required="true"
                />
              </Field>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  className={fieldClass(errors.email)}
                  autoComplete="email"
                  aria-required="true"
                />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  type="tel"
                  className={fieldClass(errors.phone)}
                  autoComplete="tel"
                />
              </Field>
            </div>

            {/* Instagram */}
            <Field label="Instagram" error={errors.instagram?.message}>
              <input
                {...register("instagram")}
                placeholder="@"
                className={fieldClass(errors.instagram)}
              />
            </Field>

            {/* Consent */}
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                {...register("consent")}
                className="mt-0.5 h-3.5 w-3.5 accent-foreground"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I agree to the{" "}
                <a href="/privacy" className="underline transition-colors hover:text-foreground">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="underline transition-colors hover:text-foreground">
                  Terms of Service
                </a>
                . Under 18 applicants confirm parental consent.
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs text-red-400">{errors.consent.message}</p>
            )}

            {/* Submit error */}
            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 space-y-1.5 text-center text-xs text-muted-foreground">
            <p>Offices in USA · Netherlands · Hungary · Ukraine</p>
            <p className="flex items-center justify-center gap-2">
              <a href="mailto:hello@scouting.agency" className="transition-colors hover:text-foreground">hello@scouting.agency</a>
              <span>·</span>
              <span>Built by <a href="https://budapestlabs.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Budapest Labs</a></span>
            </p>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-foreground/30">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-0.5 text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared input class ───────────────────────────────────

function fieldClass(error?: { message?: string }) {
  return `w-full border-b bg-transparent py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 ${
    error
      ? "border-red-400/50 focus:border-red-400"
      : "border-border focus:border-foreground/30"
  }`;
}
