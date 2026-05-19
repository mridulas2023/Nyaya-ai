"use client";

import { useEffect, useState } from "react";

import {
  Upload,
  FileText,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

import Tesseract from "tesseract.js";

import jsPDF from "jspdf";

export default function Home() {

  const [fileName, setFileName] = useState("");

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [extractedText, setExtractedText] = useState("");

  const [summary, setSummary] = useState("");

  const [risk, setRisk] = useState("");

  const [action, setAction] = useState("");

  const [displayedSummary, setDisplayedSummary] = useState("");

  const [question, setQuestion] = useState("");

  const [chatAnswer, setChatAnswer] = useState("");

  const [chatLoading, setChatLoading] = useState(false);

  // Typing Animation
  useEffect(() => {

    if (!summary) return;

    let index = 0;

    setDisplayedSummary("");

    const interval = setInterval(() => {

      setDisplayedSummary(
        summary.slice(0, index)
      );

      index++;

      if (index > summary.length) {
        clearInterval(interval);
      }

    }, 15);

    return () => clearInterval(interval);

  }, [summary]);

  // Download PDF
  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(22);

    doc.text("NyayaAI Legal Report", 20, 20);

    doc.setFontSize(14);

    doc.text("Summary:", 20, 40);

    doc.text(displayedSummary || "No summary", 20, 50, {
      maxWidth: 170,
    });

    doc.text(`Risk Level: ${risk}`, 20, 110);

    doc.text("Suggested Action:", 20, 130);

    doc.text(action || "No action", 20, 140, {
      maxWidth: 170,
    });

    doc.save("NyayaAI_Report.pdf");
  };

  // Process File
  const processFile = async (file: File) => {

    setFileName(file.name);

    setLoading(true);

    try {

      let text = "";

      // PDF
      if (file.type === "application/pdf") {

        const pdfjsLib = await import(
          "pdfjs-dist/legacy/build/pdf.mjs"
        );

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url
          ).toString();

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;

        for (
          let pageNum = 1;
          pageNum <= pdf.numPages;
          pageNum++
        ) {

          const page = await pdf.getPage(pageNum);

          const content = await page.getTextContent();

          const pageText = content.items
            .map((item: any) => item.str)
            .join(" ");

          text += pageText + "\n";
        }

      } else {

        // OCR
        const result = await Tesseract.recognize(
          file,
          "eng"
        );

        text = result.data.text;
      }

      setExtractedText(text);

      // AI Analysis
      const response = await fetch("/api/analyze", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          text,
        }),
      });

      const data = await response.json();

      const resultText = data.result;

      const summaryMatch = resultText.match(
        /SUMMARY:\s*([\s\S]*?)RISK:/i
      );

      const riskMatch = resultText.match(
        /RISK:\s*([\s\S]*?)ACTION:/i
      );

      const actionMatch = resultText.match(
        /ACTION:\s*([\s\S]*)/i
      );

      setSummary(summaryMatch?.[1]?.trim() || "");

      setRisk(riskMatch?.[1]?.trim() || "");

      setAction(actionMatch?.[1]?.trim() || "");

    } catch (error) {

      console.error(error);

      alert("Something went wrong");
    }

    setLoading(false);
  };

  // File Input Upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) return;

    processFile(file);
  };

  // Ask AI Questions
  const askQuestion = async () => {

    if (!question.trim()) return;

    setChatLoading(true);

    try {

      const response = await fetch("/api/analyze", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          text: `
Legal Document:
${extractedText}

User Question:
${question}

Answer the question clearly in simple language.
          `,
        }),
      });

      const data = await response.json();

      setChatAnswer(data.result);

    } catch (error) {

      console.error(error);

      alert("Failed to get AI response");
    }

    setChatLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-100px] w-[350px] h-[350px] bg-blue-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-[-120px] right-[-100px] w-[350px] h-[350px] bg-purple-500/20 blur-[120px] rounded-full"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Navbar */}
        <div className="flex items-center justify-between mb-16">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">

              <ShieldAlert size={30} />

            </div>

            <div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                NyayaAI
              </h1>

              <p className="text-slate-400 text-sm">
                AI Legal Assistant for Indians
              </p>

            </div>

          </div>

          <button className="border border-slate-700 bg-white/5 backdrop-blur-lg px-5 py-2 rounded-xl hover:bg-white/10 transition">
            AI Powered
          </button>

        </div>

        {/* Hero */}
        <div className="text-center mb-16">

          <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">

            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Understand Legal Documents
            </span>

            <br />

            <span className="text-white">
              In Simple Language
            </span>

          </h2>

          <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Upload legal documents and instantly receive AI-powered summaries,
            risk analysis, and suggested legal actions.
          </p>

        </div>

        {/* Upload Box */}
        <div

          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}

          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}

          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}

          onDrop={(e) => {

            e.preventDefault();

            setDragActive(false);

            const file = e.dataTransfer.files?.[0];

            if (file) {
              processFile(file);
            }
          }}

          className={`
            bg-white/5 backdrop-blur-lg border rounded-[35px]
            p-14 text-center shadow-2xl transition-all duration-300
            ${
              dragActive
                ? "border-blue-400 scale-[1.02] shadow-blue-500/30"
                : "border-slate-700"
            }
          `}
        >

          <div className="flex flex-col items-center">

            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">

              <Upload
                size={50}
                className="text-blue-400"
              />

            </div>

            <h2 className="text-3xl font-bold mb-3">
              Upload Your Document
            </h2>

            <p className="text-slate-400 mb-8">
              Drag & Drop or Upload JPG, PNG & PDF
            </p>

            <label className="bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 transition transform px-8 py-4 rounded-2xl font-semibold cursor-pointer shadow-lg shadow-blue-500/30">

              Choose File

              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />

            </label>

            {fileName && (
              <p className="mt-8 text-green-400 font-medium">
                ✅ Selected File: {fileName}
              </p>
            )}

            {loading && (
              <p className="mt-6 text-yellow-400 animate-pulse">
                🤖 AI is analyzing document...
              </p>
            )}

          </div>

        </div>

        {/* Results */}
        {summary && (

          <div className="mt-14 grid lg:grid-cols-2 gap-8">

            {/* Extracted Text */}
            <div className="bg-white/5 backdrop-blur-lg border border-slate-700 rounded-3xl p-8 shadow-xl">

              <div className="flex items-center gap-3 mb-6">

                <FileText className="text-blue-400" />

                <h2 className="text-3xl font-bold text-blue-400">
                  Extracted Text
                </h2>

              </div>

              <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5 max-h-[500px] overflow-y-auto">

                <pre className="whitespace-pre-wrap text-slate-300 leading-loose text-sm">
                  {extractedText}
                </pre>

              </div>

            </div>

            {/* AI Analysis */}
            <div className="space-y-6">

              {/* Summary */}
              <div className="bg-white/5 backdrop-blur-lg border border-slate-700 rounded-3xl p-8 shadow-xl">

                <div className="flex items-center gap-3 mb-5">

                  <FileText className="text-cyan-400" />

                  <h2 className="text-3xl font-bold text-cyan-400">
                    Summary
                  </h2>

                </div>

                <p className="text-slate-300 leading-relaxed text-lg">
                  {displayedSummary}
                </p>

              </div>

              {/* Risk + Action */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Risk */}
                <div
                  className={`
                    rounded-3xl p-7 border shadow-xl backdrop-blur-lg
                    ${
                      risk.toLowerCase().includes("high")
                        ? "border-red-500 bg-red-500/10"
                        : risk.toLowerCase().includes("medium")
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-green-500 bg-green-500/10"
                    }
                  `}
                >

                  <div className="flex items-center gap-3 mb-4">

                    <ShieldAlert
                      className={`
                        ${
                          risk.toLowerCase().includes("high")
                            ? "text-red-400"
                            : risk.toLowerCase().includes("medium")
                            ? "text-yellow-400"
                            : "text-green-400"
                        }
                      `}
                    />

                    <h3 className="text-2xl font-bold">
                      Risk Level
                    </h3>

                  </div>

                  <div className="inline-block px-4 py-2 rounded-full bg-black/30 border border-white/10 mb-4">
                    {risk}
                  </div>

                  <p className="text-slate-300">
                    AI detected possible legal concerns in this document.
                  </p>

                </div>

                {/* Suggested Action */}
                <div className="rounded-3xl p-7 border border-green-500 bg-green-500/10 shadow-xl backdrop-blur-lg">

                  <div className="flex items-center gap-3 mb-4">

                    <CheckCircle2 className="text-green-400" />

                    <h3 className="text-2xl font-bold text-green-400">
                      Suggested Action
                    </h3>

                  </div>

                  <p className="text-slate-300 leading-relaxed mb-6">
                    {action}
                  </p>

                  <button
                    onClick={downloadPDF}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition transform px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-cyan-500/30"
                  >
                    📥 Download Report
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* Chat With Document */}
        {summary && (

          <div className="mt-10 bg-white/5 backdrop-blur-lg border border-slate-700 rounded-3xl p-8 shadow-xl">

            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

              💬 Chat With Document

            </h2>

            <div className="flex flex-col md:flex-row gap-4">

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this document..."
                className="flex-1 bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-cyan-500 text-white"
              />

              <button
                onClick={askQuestion}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition transform px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-cyan-500/30"
              >

                Ask AI

              </button>

            </div>

            {chatLoading && (
              <p className="mt-5 text-yellow-400 animate-pulse">
                🤖 AI is thinking...
              </p>
            )}

            {chatAnswer && (
              <div className="mt-6 bg-[#020617] border border-slate-800 rounded-2xl p-6">

                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {chatAnswer}
                </p>

              </div>
            )}

          </div>

        )}

        {/* Footer */}
        <div className="text-center mt-20 text-slate-500 text-sm">
          © 2026 NyayaAI. Built with ❤️ for Indian Citizens.
        </div>

      </div>

    </main>
  );
}