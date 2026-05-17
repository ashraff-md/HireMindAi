import { jsPDF } from "jspdf";

import type { DebriefFeedbackModel } from "@/components/feedback-debrief-view";

function appendBullets(
  doc: jsPDF,
  title: string,
  items: string[],
  margin: number,
  startY: number,
  lineHeight: number,
  pageHeight: number,
): number {
  let y = startY;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, 180 - margin * 2);
    for (const line of lines) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }
  return y + 4;
}

export function downloadFeedbackPdf(args: {
  feedback: DebriefFeedbackModel;
  headline?: string;
}): void {
  const doc = new jsPDF();
  const margin = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;
  const lh = 6;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(args.headline ?? "HireMind — Interview debrief", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Composite score: ${args.feedback.score}/100`, margin, y);
  y += lh;
  doc.text(`Communication: ${args.feedback.communicationScore}`, margin, y);
  y += lh;
  doc.text(`Technical: ${args.feedback.technicalScore}`, margin, y);
  y += lh;
  doc.text(`Confidence: ${args.feedback.confidenceScore}`, margin, y);
  y += lh + 4;

  y = appendBullets(
    doc,
    "Strengths",
    args.feedback.strengths,
    margin,
    y,
    lh,
    pageHeight,
  );
  y = appendBullets(
    doc,
    "Growth areas",
    args.feedback.weaknesses,
    margin,
    y,
    lh,
    pageHeight,
  );
  appendBullets(
    doc,
    "Next reps",
    args.feedback.suggestions,
    margin,
    y,
    lh,
    pageHeight,
  );

  doc.save(`hiremind-debrief-${new Date().toISOString().slice(0, 10)}.pdf`);
}
