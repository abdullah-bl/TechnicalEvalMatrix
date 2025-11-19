import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Check,
  Printer,
  ChevronRight,
  ListChecks,
  Users,
  BarChart3,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Criterion, Competitor, Score, EvaluationProject } from "@shared/schema";


import { storage } from "@/lib/storage";

export default function EvaluationPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectTitle, setProjectTitle] = useState("مصفوفة التقييم الفنية");

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionPercentage, setNewCriterionPercentage] = useState(10);
  const [newCompetitorName, setNewCompetitorName] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    saveToStorage();
  }, [criteria, competitors, scores, projectTitle]);

  const loadFromStorage = () => {
    const project = storage.getProject();
    if (project) {
      setCriteria(project.criteria || []);
      setCompetitors(project.competitors || []);
      setScores(project.scores || []);
      setProjectTitle(project.projectTitle || "مصفوفة التقييم الفنية");
    }
  };

  const saveToStorage = () => {
    const project: EvaluationProject = {
      criteria,
      competitors,
      scores,
      projectTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveProject(project);
  };

  const addCriterion = () => {
    if (!newCriterionName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المعيار",
        variant: "destructive",
      });
      return;
    }

    const newCriterion: Criterion = {
      id: Date.now().toString(),
      name: newCriterionName,
      weight: newCriterionPercentage,
    };

    setCriteria([...criteria, newCriterion]);
    setNewCriterionName("");
    setNewCriterionPercentage(10);

    toast({
      title: "تم الإضافة",
      description: "تم إضافة المعيار بنجاح",
    });
  };

  const deleteCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
    setScores(scores.filter(s => s.criterionId !== id));
  };

  const addCompetitor = () => {
    if (!newCompetitorName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المتنافس",
        variant: "destructive",
      });
      return;
    }

    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitorName,
    };

    setCompetitors([...competitors, newCompetitor]);
    setNewCompetitorName("");

    toast({
      title: "تم الإضافة",
      description: "تم إضافة المتنافس بنجاح",
    });
  };

  const deleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
    setScores(scores.filter(s => s.competitorId !== id));
  };

  const updateScore = (criterionId: string, competitorId: string, score: number) => {
    const existingScoreIndex = scores.findIndex(
      s => s.criterionId === criterionId && s.competitorId === competitorId
    );

    if (existingScoreIndex >= 0) {
      const newScores = [...scores];
      newScores[existingScoreIndex] = { criterionId, competitorId, score };
      setScores(newScores);
    } else {
      setScores([...scores, { criterionId, competitorId, score }]);
    }
  };

  const getScore = (criterionId: string, competitorId: string): number => {
    const score = scores.find(
      s => s.criterionId === criterionId && s.competitorId === competitorId
    );
    return score?.score ?? 0;
  };

  const calculateTotalScore = (competitorId: string): number => {
    return criteria.reduce((total, criterion) => {
      const score = getScore(criterion.id, competitorId);
      return total + (score * (criterion.weight / 100));
    }, 0);
  };

  const calculateAverageScore = (competitorId: string): number => {
    if (criteria.length === 0) return 0;
    return calculateTotalScore(competitorId) / criteria.length;
  };

  const getPassedCriteriaCount = (competitorId: string): number => {
    // In weighted system, passing is determined by total score usually, but if per-criterion passing is needed:
    // Assuming 50% is pass for individual criterion score for now, or we can remove this metric if not relevant.
    // Let's keep it as "score >= 50" for now as a default pass mark for the criterion itself.
    return criteria.filter(criterion => {
      const score = getScore(criterion.id, competitorId);
      return score >= 50;
    }).length;
  };

  const getRankedCompetitors = () => {
    return [...competitors]
      .map(competitor => ({
        ...competitor,
        totalScore: calculateTotalScore(competitor.id),
        averageScore: calculateAverageScore(competitor.id),
        passedCount: getPassedCriteriaCount(competitor.id),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const handlePrint = () => {
    window.print();
  };

  const validateWeights = (): boolean => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      toast({
        title: "تنبيه",
        description: `مجموع أوزان المعايير يجب أن يكون 100% (المجموع الحالي: ${totalWeight}%)`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const canProceedToStep = (step: number): boolean => {
    if (step === 2) {
      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      return criteria.length > 0 && totalWeight === 100;
    }
    if (step === 3) return criteria.length > 0 && competitors.length > 0;
    if (step === 4) return criteria.length > 0 && competitors.length > 0;
    return true;
  };

  const steps = [
    { number: 1, title: "المعايير", icon: ListChecks },
    { number: 2, title: "المتنافسون", icon: Users },
    { number: 3, title: "التقييم", icon: BarChart3 },
    { number: 4, title: "التقرير", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-project-title">{projectTitle}</h1>
              <p className="text-sm text-muted-foreground" data-testid="text-project-subtitle">نظام تقييم فني شامل للمشاريع والشركات</p>
            </div>
            {currentStep === 4 && (
              <Button
                onClick={handlePrint}
                size="lg"
                className="gap-2"
                data-testid="button-print"
              >
                <Printer className="w-5 h-5" />
                طباعة التقرير
              </Button>
            )}
          </div>

          <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1 min-w-[200px]">
                  <button
                    onClick={() => canProceedToStep(step.number) && setCurrentStep(step.number)}
                    disabled={!canProceedToStep(step.number)}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg transition-all w-full
                      ${currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : canProceedToStep(step.number)
                          ? 'bg-card hover-elevate active-elevate-2 cursor-pointer'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      }
                    `}
                    data-testid={`button-step-${step.number}`}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${currentStep === step.number
                        ? 'bg-primary-foreground/20'
                        : 'bg-background/10'
                      }
                    `}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="text-right flex-1">
                      <div className="text-sm font-semibold" data-testid={`text-step-title-${step.number}`}>{step.title}</div>
                      <div className={`text-xs ${currentStep === step.number ? 'opacity-90' : 'opacity-60'}`} data-testid={`text-step-count-${step.number}`}>
                        {step.number === 1 && `${criteria.length} معايير`}
                        {step.number === 2 && `${competitors.length} متنافسين`}
                        {step.number === 3 && 'تقييم المتنافسين'}
                        {step.number === 4 && 'النتائج النهائية'}
                      </div>
                    </div>
                    {currentStep > step.number && (
                      <Check className="w-5 h-5" data-testid={`icon-step-completed-${step.number}`} />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground flex-shrink-0" data-testid={`icon-step-separator-${step.number}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-8">
              <Card data-testid="card-criteria-setup">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-criteria-card-title">إضافة معايير التقييم</CardTitle>
                  <CardDescription data-testid="text-criteria-card-description">حدد المعايير التي سيتم تقييم المتنافسين بناءً عليها مع وزن لكل معيار (المجموع يجب أن يكون 100%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="criterion-name" data-testid="label-criterion-name">اسم المعيار</Label>
                      <Input
                        id="criterion-name"
                        placeholder="مثال: الخبرة التقنية"
                        value={newCriterionName}
                        onChange={(e) => setNewCriterionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                        disabled={criteria.reduce((sum, c) => sum + c.weight, 0) >= 100}
                        data-testid="input-criterion-name"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label data-testid="label-criterion-percentage">وزن المعيار</Label>
                        <Badge variant="secondary" className="font-mono text-lg" data-testid="text-criterion-percentage">
                          {newCriterionPercentage}%
                        </Badge>
                      </div>
                      <Slider
                        value={[newCriterionPercentage]}
                        onValueChange={(value) => setNewCriterionPercentage(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                        disabled={criteria.reduce((sum, c) => sum + c.weight, 0) >= 100}
                        data-testid="slider-criterion-percentage"
                      />
                    </div>

                    <Button
                      onClick={addCriterion}
                      className="w-full gap-2"
                      size="lg"
                      disabled={criteria.reduce((sum, c) => sum + c.weight, 0) >= 100}
                      data-testid="button-add-criterion"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة معيار
                    </Button>
                  </div>

                  {criteria.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold" data-testid="text-criteria-list-title">
                          المعايير المضافة ({criteria.length}) - المجموع: {criteria.reduce((sum, c) => sum + c.weight, 0)}%
                        </h3>
                        <div className="space-y-2">
                          {criteria.map((criterion) => (
                            <div
                              key={criterion.id}
                              className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border border-card-border"
                              data-testid={`criterion-item-${criterion.id}`}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-base mb-2" data-testid={`text-criterion-name-${criterion.id}`}>{criterion.name}</div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-muted-foreground">الوزن:</span>
                                  <Badge variant="outline" className="font-mono" data-testid={`text-criterion-passing-${criterion.id}`}>
                                    {criterion.weight}%
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCriterion(criterion.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-criterion-${criterion.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {criteria.length > 0 && (
                <div className="flex flex-wrap justify-end gap-4">
                  <Button
                    onClick={() => {
                      if (validateWeights()) {
                        setCurrentStep(2);
                      }
                    }}
                    size="lg"
                    className="gap-2"
                    data-testid="button-next-to-competitors"
                  >
                    التالي: إضافة المتنافسين
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <Card data-testid="card-competitors-setup">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-competitors-card-title">إضافة المتنافسين</CardTitle>
                  <CardDescription data-testid="text-competitors-card-description">أضف الشركات أو المتنافسين الذين سيتم تقييمهم</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="competitor-name" data-testid="label-competitor-name">اسم المتنافس / الشركة</Label>
                      <div className="flex flex-wrap gap-2">
                        <Input
                          id="competitor-name"
                          placeholder="مثال: شركة التقنية المتقدمة"
                          value={newCompetitorName}
                          onChange={(e) => setNewCompetitorName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                          className="flex-1"
                          data-testid="input-competitor-name"
                        />
                        <Button
                          onClick={addCompetitor}
                          className="gap-2"
                          data-testid="button-add-competitor"
                        >
                          <Plus className="w-5 h-5" />
                          إضافة
                        </Button>
                      </div>
                    </div>
                  </div>

                  {competitors.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold" data-testid="text-competitors-list-title">المتنافسون المضافون ({competitors.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {competitors.map((competitor) => (
                            <div
                              key={competitor.id}
                              className="flex items-center justify-between gap-3 p-4 bg-card rounded-lg border border-card-border"
                              data-testid={`competitor-item-${competitor.id}`}
                            >
                              <div className="flex-1">
                                <div className="font-medium" data-testid={`text-competitor-name-${competitor.id}`}>{competitor.name}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteCompetitor(competitor.id)}
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-competitor-${competitor.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size="lg"
                  className="gap-2"
                  data-testid="button-back-to-criteria"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  السابق
                </Button>
                {competitors.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep(3)}
                    size="lg"
                    className="gap-2"
                    data-testid="button-next-to-evaluation"
                  >
                    التالي: بدء التقييم
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <Card data-testid="card-evaluation-matrix">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-matrix-card-title">مصفوفة التقييم</CardTitle>
                  <CardDescription data-testid="text-matrix-card-description">قم بتقييم كل متنافس بناءً على المعايير المحددة (0-100)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="p-4 text-right font-semibold bg-muted/50" data-testid="header-matrix-criterion">المعيار</th>
                          <th className="p-4 text-center font-semibold bg-muted/50 text-xs" data-testid="header-matrix-passing">الوزن</th>
                          {competitors.map((competitor) => (
                            <th
                              key={competitor.id}
                              className="p-4 text-center font-semibold bg-muted/50"
                              data-testid={`header-competitor-${competitor.id}`}
                            >
                              {competitor.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {criteria.map((criterion) => (
                          <tr key={criterion.id} className="border-b border-border hover-elevate" data-testid={`row-criterion-${criterion.id}`}>
                            <td className="p-4 font-medium">
                              <div data-testid={`text-matrix-criterion-name-${criterion.id}`}>{criterion.name}</div>
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant="outline" className="font-mono text-xs" data-testid={`text-matrix-passing-${criterion.id}`}>
                                {criterion.weight}%
                              </Badge>
                            </td>
                            {competitors.map((competitor) => {
                              const score = getScore(criterion.id, competitor.id);
                              const isPassed = score >= 50;
                              return (
                                <td key={competitor.id} className="p-4">
                                  <div className="flex flex-col gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={score}
                                      onChange={(e) => {
                                        const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                        updateScore(criterion.id, competitor.id, value);
                                      }}
                                      className="text-center font-mono text-lg"
                                      data-testid={`input-score-${criterion.id}-${competitor.id}`}
                                    />
                                    <div className="text-center">
                                      {score > 0 && (
                                        <Badge
                                          variant={isPassed ? "default" : "destructive"}
                                          className="text-xs"
                                          data-testid={`badge-status-${criterion.id}-${competitor.id}`}
                                        >
                                          {isPassed ? "اجتاز" : "لم يجتز"}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="bg-muted/30 font-bold">
                          <td className="p-4" colSpan={2}>
                            <div className="text-lg" data-testid="text-matrix-total-label">المجموع الكلي</div>
                          </td>
                          {competitors.map((competitor) => (
                            <td
                              key={competitor.id}
                              className="p-4 text-center"
                              data-testid={`total-score-${competitor.id}`}
                            >
                              <div className="text-2xl font-bold font-mono text-primary" data-testid={`text-total-value-${competitor.id}`}>
                                {calculateTotalScore(competitor.id).toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground mt-1" data-testid={`text-average-value-${competitor.id}`}>
                                {/* Average is less relevant in weighted sum, maybe show raw sum or nothing */}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  size="lg"
                  className="gap-2"
                  data-testid="button-back-to-criteria"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  السابق
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  size="lg"
                  className="gap-2"
                  data-testid="button-next-to-report"
                >
                  عرض التقرير النهائي
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-wrap">
                <Card data-testid="card-stat-competitors">
                  <CardHeader className="space-y-0 pb-2">
                    <CardDescription data-testid="text-stat-competitors-label">عدد المتنافسين</CardDescription>
                    <CardTitle className="text-3xl font-bold font-mono" data-testid="text-total-competitors">
                      {competitors.length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card data-testid="card-stat-criteria">
                  <CardHeader className="space-y-0 pb-2">
                    <CardDescription data-testid="text-stat-criteria-label">عدد المعايير</CardDescription>
                    <CardTitle className="text-3xl font-bold font-mono" data-testid="text-total-criteria">
                      {criteria.length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card data-testid="card-stat-max-score">
                  <CardHeader className="space-y-0 pb-2">
                    <CardDescription data-testid="text-stat-max-label">الدرجة القصوى</CardDescription>
                    <CardTitle className="text-3xl font-bold font-mono" data-testid="text-max-score">
                      100%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card data-testid="card-ranking">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-ranking-card-title">الترتيب النهائي</CardTitle>
                  <CardDescription data-testid="text-ranking-card-description">ترتيب المتنافسين حسب المجموع الكلي</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getRankedCompetitors().map((competitor, index) => (
                    <div
                      key={competitor.id}
                      className="flex items-center gap-4 p-6 bg-card rounded-lg border border-card-border"
                      data-testid={`rank-item-${index + 1}`}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : ''}
                        ${index === 1 ? 'bg-gray-400/20 text-gray-700 dark:text-gray-400' : ''}
                        ${index === 2 ? 'bg-orange-600/20 text-orange-700 dark:text-orange-400' : ''}
                        ${index > 2 ? 'bg-muted text-muted-foreground' : ''}
                      `} data-testid={`badge-rank-position-${index + 1}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold mb-2" data-testid={`text-rank-name-${index + 1}`}>{competitor.name}</div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>المجموع:</span>
                            <Badge variant="secondary" className="font-mono text-base" data-testid={`text-rank-total-${index + 1}`}>
                              {competitor.totalScore.toFixed(2)}%
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span>المعدل:</span>
                            <Badge variant="outline" className="font-mono" data-testid={`text-rank-average-${index + 1}`}>
                              {competitor.averageScore.toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Removed passed count as it's less relevant for weighted total */}
                          </div>
                        </div>
                        <Progress
                          value={competitor.totalScore}
                          className="mt-3 h-2"
                          data-testid={`progress-rank-${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card data-testid="card-detailed-results">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-details-card-title">النتائج التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="p-4 text-right font-semibold" data-testid="header-report-competitor">المتنافس</th>
                          {criteria.map((criterion) => (
                            <th key={criterion.id} className="p-4 text-center font-semibold" data-testid={`header-report-criterion-${criterion.id}`}>
                              <div className="flex flex-col items-center gap-1">
                                <span>{criterion.name}</span>
                                <Badge variant="outline" className="text-[10px] font-normal">
                                  {criterion.weight}%
                                </Badge>
                              </div>
                            </th>
                          ))}
                          <th className="p-4 text-center font-semibold bg-muted/20" data-testid="header-report-total">المجموع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getRankedCompetitors().map((competitor, index) => (
                          <tr
                            key={competitor.id}
                            className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                            data-testid={`row-report-competitor-${competitor.id}`}
                          >
                            <td className="p-4 font-medium" data-testid={`text-report-competitor-name-${competitor.id}`}>{competitor.name}</td>
                            {criteria.map((criterion) => {
                              const score = getScore(criterion.id, competitor.id);
                              const weightedScore = score * (criterion.weight / 100);
                              return (
                                <td key={criterion.id} className="p-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-mono font-bold" data-testid={`text-report-score-${competitor.id}-${criterion.id}`}>{score}</span>
                                    <span className="text-xs text-muted-foreground">({weightedScore.toFixed(1)})</span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-4 text-center font-bold font-mono text-primary bg-muted/20">
                              {calculateTotalScore(competitor.id).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  size="lg"
                  className="gap-2"
                  data-testid="button-back-to-evaluation"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  السابق
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={printRef} className="hidden print:block" data-testid="section-print-report">
        <div className="p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-print-title">{projectTitle}</h1>
            <p className="text-lg text-muted-foreground" data-testid="text-print-subtitle">تقرير التقييم الفني النهائي</p>
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-print-date">
              تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" data-testid="text-print-ranking-title">الترتيب النهائي</h2>
            <table className="w-full border border-border" data-testid="table-print-ranking">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-right border-b border-border" data-testid="header-print-rank-position">الترتيب</th>
                  <th className="p-3 text-right border-b border-border" data-testid="header-print-rank-competitor">المتنافس</th>
                  <th className="p-3 text-center border-b border-border" data-testid="header-print-rank-total">المجموع (100%)</th>
                </tr>
              </thead>
              <tbody>
                {getRankedCompetitors().map((competitor, index) => (
                  <tr key={competitor.id} className="border-b border-border" data-testid={`row-print-rank-${index + 1}`}>
                    <td className="p-3 text-center font-bold" data-testid={`text-print-rank-position-${index + 1}`}>{index + 1}</td>
                    <td className="p-3" data-testid={`text-print-rank-name-${index + 1}`}>{competitor.name}</td>
                    <td className="p-3 text-center font-mono font-bold" data-testid={`text-print-rank-total-${index + 1}`}>{competitor.totalScore.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6" data-testid="text-print-details-title">النتائج التفصيلية</h2>
            <table className="w-full border border-border" data-testid="table-print-details">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-right border-b border-border" data-testid="header-print-detail-competitor">المتنافس</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id} className="p-3 text-center border-b border-border" data-testid={`header-print-detail-criterion-${criterion.id}`}>
                      <div className="flex flex-col items-center">
                        <span>{criterion.name}</span>
                        <span className="text-xs font-normal">({criterion.weight}%)</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center border-b border-border" data-testid="header-print-detail-total">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {getRankedCompetitors().map((competitor) => (
                  <tr key={competitor.id} className="border-b border-border" data-testid={`row-print-detail-${competitor.id}`}>
                    <td className="p-3 font-bold" data-testid={`text-print-detail-competitor-${competitor.id}`}>{competitor.name}</td>
                    {criteria.map((criterion) => {
                      const score = getScore(criterion.id, competitor.id);
                      const weightedScore = score * (criterion.weight / 100);
                      return (
                        <td key={criterion.id} className="p-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono">{score}</span>
                            <span className="text-xs text-muted-foreground">({weightedScore.toFixed(1)})</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold font-mono bg-muted/10">
                      {calculateTotalScore(competitor.id).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
