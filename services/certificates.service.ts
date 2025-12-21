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

    // Save certificate template configuration
    async saveCertificateTemplate(config: any) {
        const { data } = await apiClient.post('/certificates/template/save', config);
        return data;
    }

    // Get certificate template configuration
    async getCertificateTemplate() {
        const { data } = await apiClient.get('/certificates/template');
        return data;
    }

    // Get certificate for preview (includes student name and certificate ID for barcode)
    async getCertificateForPreview(userId: string, courseId: string) {
        const { data } = await apiClient.get<CertificateDto>(`/certificates/preview/${userId}/${courseId}`);
        return data;
    }

    // Revoke certificate
    async revokeCertificate(certificateId: string, reason?: string) {
        const { data } = await apiClient.post(`/certificates/revoke/${certificateId}`, { reason });
        return data;
    }

    // Restore revoked certificate
    async restoreCertificate(certificateId: string) {
        const { data } = await apiClient.post(`/certificates/restore/${certificateId}`);
        return data;
    }

    // Search certificates with filters
    async searchCertificates(params: {
        query?: string;
        courseId?: string;
        status?: 'issued' | 'revoked' | 'expired';
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const { data } = await apiClient.get('/certificates/search/advanced', { params });
        return data;
    }

    // Get certificate analytics/statistics
    async getCertificateStats(userId?: string) {
        const { data } = await apiClient.get('/certificates/stats/analytics', {
            params: userId ? { userId } : undefined
        });
        return data;
    }

    // Resend certificate email (user-facing)
    async resendCertificateEmail(certificateId: string) {
        const { data } = await apiClient.post(`/certificates/resend-email/${certificateId}`);
        return data;
    }
}

export const certificatesService = new CertificatesService();

