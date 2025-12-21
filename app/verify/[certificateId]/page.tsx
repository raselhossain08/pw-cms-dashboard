"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { certificatesService } from "@/services/certificates.service";
import {
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const {
    data: certificate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["verify-certificate", certificateId],
    queryFn: () => certificatesService.verifyCertificate(certificateId),
    enabled: !!certificateId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">
                    Certificate Not Found
                  </CardTitle>
                  <p className="text-sm text-red-600 mt-1">
                    This certificate could not be verified
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  The certificate with ID <strong>{certificateId}</strong> does
                  not exist in our system or may have been revoked.
                </p>
                <p className="text-red-700 text-sm mt-2">
                  Please verify the certificate ID and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isRevoked = (certificate as any).isRevoked;
  const isExpired =
    (certificate as any).expiryDate &&
    new Date((certificate as any).expiryDate) < new Date();
  const isValid = !isRevoked && !isExpired;

  const student =
    typeof certificate.student === "object"
      ? certificate.student
      : { firstName: "Student", lastName: "" };
  const course =
    typeof certificate.course === "object"
      ? certificate.course
      : { title: "Course" };

  const studentName = `${student.firstName || ""} ${
    student.lastName || ""
  }`.trim();
  const courseName = course.title || "Unknown Course";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Certificate Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Verify the authenticity of this certificate
          </p>
        </div>

        {/* Status Card */}
        <Card
          className={`${
            isValid
              ? "border-green-200 bg-green-50"
              : isRevoked
              ? "border-red-200 bg-red-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isValid
                    ? "bg-green-100"
                    : isRevoked
                    ? "bg-red-100"
                    : "bg-orange-100"
                }`}
              >
                {isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : isRevoked ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <div>
                <CardTitle
                  className={
                    isValid
                      ? "text-green-900"
                      : isRevoked
                      ? "text-red-900"
                      : "text-orange-900"
                  }
                >
                  {isValid
                    ? "Valid Certificate"
                    : isRevoked
                    ? "Revoked Certificate"
                    : "Expired Certificate"}
                </CardTitle>
                <p
                  className={`text-sm mt-1 ${
                    isValid
                      ? "text-green-600"
                      : isRevoked
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {isValid
                    ? "This certificate is authentic and valid"
                    : isRevoked
                    ? "This certificate has been revoked"
                    : "This certificate has expired"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Awarded To</p>
                  <p className="font-semibold text-gray-900">{studentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold text-gray-900">{courseName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Certificate ID</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">
                    {certificate.certificateId}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Issued On</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(certificate.issuedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {isRevoked && (certificate as any).revocationReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-900 mb-1">
                  Revocation Reason:
                </p>
                <p className="text-red-800">
                  {(certificate as any).revocationReason}
                </p>
              </div>
            )}

            {isExpired && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-semibold text-orange-900 mb-1">
                  Expiry Date:
                </p>
                <p className="text-orange-800">
                  {new Date((certificate as any).expiryDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            This verification page confirms the authenticity of the certificate.
          </p>
          <p className="mt-1">
            For any inquiries, please contact the issuing institution.
          </p>
        </div>
      </div>
    </div>
  );
}
