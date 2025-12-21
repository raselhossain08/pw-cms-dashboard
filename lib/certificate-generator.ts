import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

// Cache for loaded resources to improve performance
let cachedSvgText: string | null = null;
let cachedFontBase64: { regular: string | null; bold: string | null } = {
    regular: null,
    bold: null,
};

interface CertificateConfig {
    namePosition: { x: number; y: number };
    barcodePosition: { x: number; y: number };
    nameStyle: {
        fontSize: number;
        color: string;
        fontWeight: string;
    };
    barcodeStyle: {
        fontSize: number;
        color: string;
        width: number;
        height: number;
        displayWidth: number;
        displayHeight: number;
    };
}

interface GenerateCertificateOptions {
    studentName: string;
    certificateId: string;
    courseName?: string;
    config?: CertificateConfig;
}

/**
 * Generate a certificate PDF with real student data
 */
export async function generateCertificatePDF(
    options: GenerateCertificateOptions
): Promise<Blob> {
    // Validate and provide defaults for required parameters
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options provided to generateCertificatePDF');
    }

    const {
        studentName = "Student",
        certificateId = "CERT-000",
        config
    } = options;

    // Default config if not provided
    const defaultConfig: CertificateConfig = {
        namePosition: { x: 50, y: 45 },
        barcodePosition: { x: 15, y: 75 },
        nameStyle: {
            fontSize: 32,
            color: "#dc2626",
            fontWeight: "600",
        },
        barcodeStyle: {
            fontSize: 14,
            color: "#000000",
            width: 2,
            height: 50,
            displayWidth: 200,
            displayHeight: 80,
        },
    };

    const finalConfig = config || defaultConfig;

    // Create PDF in landscape A4 format
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Load SVG (use cache if available)
    if (!cachedSvgText) {
        const svgResponse = await fetch("/certificate-template.svg");
        cachedSvgText = await svgResponse.text();
    }
    const svgText = cachedSvgText;

    // Create a temporary canvas to convert SVG to image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    // Set canvas size to match A4 landscape (optimized for smaller file size)
    const scale = 1.5; // Balanced quality and file size
    canvas.width = pageWidth * scale * 3.78; // Convert mm to pixels (1mm = 3.78px at 96 DPI)
    canvas.height = pageHeight * scale * 3.78;

    // Create SVG blob and image
    const svgBlob = new Blob([svgText], {
        type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
    });

    // Draw SVG to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(svgUrl);

    // Convert canvas to JPEG with compression for smaller file size
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    // Add image to PDF
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

    // Use built-in fonts for reliable text rendering
    // Custom fonts (OTF) often have encoding issues with jsPDF
    pdf.setFont(
        "helvetica",
        finalConfig.nameStyle.fontWeight === "600" ? "bold" : "normal"
    );

    // Calculate text positions (convert percentage to mm)
    const nameX = (finalConfig.namePosition.x / 100) * pageWidth;
    const nameY = (finalConfig.namePosition.y / 100) * pageHeight;
    const barcodeX = (finalConfig.barcodePosition.x / 100) * pageWidth;
    const barcodeY = (finalConfig.barcodePosition.y / 100) * pageHeight;

    // Set font size and color for name
    pdf.setFontSize(finalConfig.nameStyle.fontSize * 0.75); // Convert px to pt
    pdf.setTextColor(finalConfig.nameStyle.color);

    // Add student name with proper text encoding
    const validStudentName = studentName && studentName.trim() !== "" ? studentName : "Student";
    pdf.text(validStudentName, nameX, nameY, {
        align: "center",
        baseline: "middle"
    });

    // Generate and add barcode
    try {
        const barcodeCanvas = document.createElement("canvas");
        JsBarcode(barcodeCanvas, certificateId, {
            format: "CODE128",
            width: finalConfig.barcodeStyle.width,
            height: finalConfig.barcodeStyle.height,
            displayValue: true,
            fontSize: finalConfig.barcodeStyle.fontSize,
            textMargin: 2,
            margin: 5,
        });

        const barcodeImgData = barcodeCanvas.toDataURL("image/png");

        // Calculate barcode dimensions in mm based on display size
        const barcodeWidth = finalConfig.barcodeStyle.displayWidth / 3.78;
        const barcodeHeight = finalConfig.barcodeStyle.displayHeight / 3.78;

        // Center barcode on position
        pdf.addImage(
            barcodeImgData,
            "PNG",
            barcodeX - barcodeWidth / 2,
            barcodeY - barcodeHeight / 2,
            barcodeWidth,
            barcodeHeight
        );
    } catch (barcodeError) {
        console.error("Barcode generation error:", barcodeError);
    }

    // Return PDF as blob
    return pdf.output("blob");
}

/**
 * Download a certificate PDF
 */
export async function downloadCertificate(
    options: GenerateCertificateOptions,
    filename?: string
): Promise<void> {
    const blob = await generateCertificatePDF(options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Safe filename generation with fallbacks
    const safeName = (options.studentName || "Student").replace(/\s+/g, "-");
    const safeCertId = options.certificateId || "CERT";

    a.download = filename || `certificate-${safeName}-${safeCertId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}
