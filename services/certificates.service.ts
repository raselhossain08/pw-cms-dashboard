import { apiClient } from "@/lib/api-client";

export interface CertificateDto {
    _id: string;
    student: { _id: string; firstName?: string; lastName?: string; email?: string } | string;
    course: { _id: string; title?: string } | string;
    certificateId: string;
    issuedAt: string;
    certificateUrl?: string;
    emailSent?: boolean;
    emailSentAt?: string;
}

class CertificatesService {
    async getMyCertificates() {
        const { data } = await apiClient.get<CertificateDto[]>("/certificates/my-certificates");
        return data;
    }

    async getCourseCertificates(courseId: string) {
        const { data } = await apiClient.get<CertificateDto[]>(`/certificates/course/${courseId}`);
        return data;
    }

    async generateCertificate(courseId: string) {
        const { data } = await apiClient.post<CertificateDto>(`/certificates/generate/${courseId}`);
        return data;
    }

    async getCertificate(id: string) {
        const { data } = await apiClient.get<CertificateDto>(`/certificates/${id}`);
        return data;
    }

    async verifyCertificate(certificateId: string) {
        const { data } = await apiClient.get<CertificateDto | null>(`/certificates/verify/${certificateId}`);
        return data;
    }

    // Admin: Generate certificate for a user
    async adminGenerateCertificate(userId: string, courseId: string, sendEmail = false) {
        const { data } = await apiClient.post<CertificateDto>(
            `/certificates/admin/generate/${userId}/${courseId}?sendEmail=${sendEmail}`
        );
        return data;
    }

    // Admin: Send certificate via email
    async adminSendCertificateEmail(certificateId: string) {
        const { data } = await apiClient.post(`/certificates/admin/send-email/${certificateId}`);
        return data;
    }

    // Admin: Bulk generate certificates
    async adminBulkGenerateCertificates(courseId: string, userIds: string[], sendEmail = false) {
        const { data } = await apiClient.post<CertificateDto[]>(
            `/certificates/admin/bulk-generate/${courseId}?sendEmail=${sendEmail}&userIds=${userIds.join(',')}`
        );
        return data;
    }
}

export const certificatesService = new CertificatesService();

