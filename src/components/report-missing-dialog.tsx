import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ImageUp,
  MapPin,
  Phone,
  Send,
  Shirt,
  Trash2,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOTLINE = "+375 (25) 633-28-03";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  fullName: z.string().trim().min(3, "Укажите ФИО пропавшего").max(120),
  gender: z.string().optional(),
  age: z.string().trim().max(3).optional(),
  birthDate: z.string().optional(),
  region: z.string().optional(),
  city: z.string().trim().max(120).optional(),
  lastSeenPlace: z.string().trim().min(3, "Укажите последнее известное место").max(200),
  missingDate: z.string().optional(),
  missingTime: z.string().optional(),
  height: z.string().trim().max(3).optional(),
  build: z.string().optional(),
  appearance: z.string().trim().max(600).optional(),
  marks: z.string().trim().max(600).optional(),
  clothes: z.string().trim().max(600).optional(),
  medical: z.string().trim().max(600).optional(),
  direction: z.string().trim().max(600).optional(),
  circumstances: z.string().trim().max(1200).optional(),
  reporterName: z.string().trim().min(2, "Укажите ваше имя").max(120),
  reporterPhone: z
    .string()
    .trim()
    .min(7, "Укажите телефон для связи")
    .max(30)
    .regex(/^[\d\s()+-]+$/, "Телефон может содержать только цифры и символы + ( ) -"),
  consent: z.literal(true, { errorMap: () => ({ message: "Необходимо согласие" }) }),
  company: z.string().max(0).optional(),
});

type FormValues = z.input<typeof schema>;

const STEPS = [
  { id: 0, title: "Кто пропал", icon: User, fields: ["fullName"] },
  { id: 1, title: "Когда и где", icon: MapPin, fields: ["lastSeenPlace"] },
  { id: 2, title: "Приметы", icon: Shirt, fields: [] },
  { id: 3, title: "Ваши данные", icon: Phone, fields: ["reporterName", "reporterPhone", "consent"] },
] as const;

const REGIONS = [
  "г. Минск",
  "Брестская область",
  "Витебская область",
  "Гомельская область",
  "Гродненская область",
  "Минская область",
  "Могилёвская область",
];

const BUILDS = ["Худощавое", "Нормальное", "Спортивное", "Плотное", "Полное"];

function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] font-semibold text-foreground">
        {label}
        {required ? (
          <span className="text-primary"> *</span>
        ) : (
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            необязательно
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function ReportMissingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<{ name: string; url: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { consent: false as unknown as true, company: "" },
  });

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function handleFile(file?: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Подойдёт файл JPG, PNG или WEBP");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Фото больше 5 МБ");
      return;
    }
    setPhoto({ name: file.name, url: URL.createObjectURL(file) });
  }

  async function next() {
    const ok = await trigger(STEPS[step].fields as unknown as (keyof FormValues)[]);
    if (!ok) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const onSubmit = async (values: FormValues) => {
    if (values.company) return; // honeypot
    await new Promise((r) => setTimeout(r, 700));
    setSent(true);
    toast.success("Заявка отправлена. Координатор свяжется с вами.");
  };

  function closeAndReset(v: boolean) {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        reset();
        setStep(0);
        setPhoto(null);
        setSent(false);
      }, 250);
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-[var(--shadow-modal)] sm:max-w-[680px]"
      >
        <div className="relative px-6 py-5 text-primary-foreground" style={{ background: "var(--gradient-alert)" }}>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-display truncate text-xl font-extrabold tracking-tight">
                Сообщить о пропавшем
              </DialogTitle>
              <DialogDescription className="truncate text-sm text-primary-foreground/80">
                Заполните форму — координатор ответит в течение 15 минут
              </DialogDescription>
            </div>
            <button
              onClick={() => closeAndReset(false)}
              aria-label="Закрыть"
              className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/15"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <a
          href={`tel:${HOTLINE.replace(/[^\d+]/g, "")}`}
          className="flex items-center justify-center gap-2 bg-soft-danger py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Phone className="size-4" />
          Горячая линия: {HOTLINE}
        </a>

        {sent ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-soft-danger text-primary">
              <Check className="size-7" />
            </div>
            <h3 className="font-display text-xl font-bold">Заявка принята</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Координатор отряда свяжется с вами в течение 15 минут. Если ситуация экстренная — позвоните
              на горячую линию.
            </p>
            <Button className="mt-2" onClick={() => closeAndReset(false)}>
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
            {/* Шаги */}
            <div className="border-b bg-card px-6 pt-4">
              <div className="flex items-center gap-1.5">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  const done = i < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => (i < step ? setStep(i) : void next())}
                      className={cn(
                        "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : done
                            ? "text-foreground hover:bg-muted"
                            : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {done ? <Check className="size-4 shrink-0" /> : <Icon className="size-4 shrink-0" />}
                      <span className="truncate">{s.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("company")} />

              {step === 0 && (
                <>
                  <Field label="ФИО пропавшего" required error={errors.fullName?.message}>
                    <Input placeholder="Иванов Иван Иванович" {...register("fullName")} />
                  </Field>

                  <Field label="Фото пропавшего">
                    {photo ? (
                      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                        <img
                          src={photo.url}
                          alt="Загруженное фото пропавшего человека"
                          className="size-16 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">{photo.name}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setPhoto(null)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragging(false);
                          handleFile(e.dataTransfer.files?.[0]);
                        }}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                        )}
                      >
                        <ImageUp className="size-7 text-primary" />
                        <p className="text-sm font-medium">Выберите фото или перетащите сюда</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG до 5 МБ</p>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Пол">
                      <Select onValueChange={(v) => setValue("gender", v)} value={watch("gender")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбран" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Мужской">Мужской</SelectItem>
                          <SelectItem value="Женский">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Возраст">
                      <Input inputMode="numeric" placeholder="напр. 38" {...register("age")} />
                    </Field>
                  </div>

                  <Field label="Дата рождения" hint="Можно указать только возраст и оставить дату пустой.">
                    <Input type="date" {...register("birthDate")} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Область проживания">
                      <Select onValueChange={(v) => setValue("region", v)} value={watch("region")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбрана" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Населённый пункт">
                      <Input placeholder="Город, посёлок, деревня" {...register("city")} />
                    </Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Последнее известное место" required error={errors.lastSeenPlace?.message}>
                    <Input placeholder="Адрес, населённый пункт или ориентир" {...register("lastSeenPlace")} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Дата пропажи">
                      <Input type="date" {...register("missingDate")} />
                    </Field>
                    <Field label="Примерное время">
                      <Input type="time" {...register("missingTime")} />
                    </Field>
                  </div>
                  <Field label="Куда мог направиться">
                    <Textarea rows={3} placeholder="Дача, работа, знакомые, лес, вокзал…" {...register("direction")} />
                  </Field>
                  <Field label="Обстоятельства пропажи">
                    <Textarea
                      rows={4}
                      placeholder="Что предшествовало, кто видел последним, был ли телефон при себе"
                      {...register("circumstances")}
                    />
                  </Field>
                  <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                    Заполните то, что вам известно. Необязательные поля можно пропустить — координатор
                    уточнит недостающее после получения заявки.
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Рост, см">
                      <Input inputMode="numeric" placeholder="напр. 175" {...register("height")} />
                    </Field>
                    <Field label="Телосложение">
                      <Select onValueChange={(v) => setValue("build", v)} value={watch("build")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Не выбрано" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUILDS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Внешность">
                    <Textarea rows={2} placeholder="Цвет и длина волос, глаза, борода" {...register("appearance")} />
                  </Field>
                  <Field label="Особые приметы">
                    <Textarea rows={2} placeholder="Шрамы, татуировки, очки, трость" {...register("marks")} />
                  </Field>
                  <Field label="Во что был одет">
                    <Textarea rows={2} placeholder="Куртка, обувь, головной убор, цвета" {...register("clothes")} />
                  </Field>
                  <Field label="Медицинские особенности">
                    <Textarea
                      rows={2}
                      placeholder="Деменция, диабет, потеря памяти, приём лекарств"
                      {...register("medical")}
                    />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ваше имя" required error={errors.reporterName?.message}>
                      <Input placeholder="Как к вам обращаться" {...register("reporterName")} />
                    </Field>
                    <Field label="Ваш телефон" required error={errors.reporterPhone?.message}>
                      <Input placeholder="+375 (__) ___-__-__" {...register("reporterPhone")} />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/40 p-4">
                    <Checkbox
                      checked={watch("consent") as boolean}
                      onCheckedChange={(v) =>
                        setValue("consent", Boolean(v) as true, { shouldValidate: true })
                      }
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      Я даю согласие на обработку моих персональных данных в соответствии с политикой
                      конфиденциальности организации <span className="text-primary">*</span>
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs font-medium text-destructive">{errors.consent.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t bg-card px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="size-4" /> Назад
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next}>
                  Далее <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="size-4" />
                  {isSubmitting ? "Отправляем…" : "Отправить заявку"}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
