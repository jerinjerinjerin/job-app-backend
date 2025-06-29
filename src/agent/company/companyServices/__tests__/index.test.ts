
import { prismaMock } from '../../../../__mocks__/prisma'; 
import { sendOtpToPhone } from '../../../../aws/sendPhoneOtp/sendOtpPhone';
import { redis } from '../../../../lib/radis';
import { companyOtpService } from '../../../../lib/radis/agent';
import { companyService } from '../index';

jest.mock('../../../../lib/radis/agent/index.ts');
jest.mock('../../../../aws/sendPhoneOtp/sendOtpPhone.ts');
jest.mock('../../../../lib/radis/index.ts', () => ({
  redis: {
    get: jest.fn(),
    del: jest.fn(),
  },
}));
jest.mock('../../../../generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

describe('companyService', () => {
  describe('createCompanyService', () => {
    it('should throw validation error if userId is missing', async () => {
      await expect(
        companyService.createCompanyService({
          name: 'Test Company',
          phone: '1234567890',
          userId: '', // Invalid
          website: '',
          description: '',
          logo: '',
        })
      ).rejects.toThrow('User ID is required.');
    });

    it('should send OTP if inputs are valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'AGENT' });
      prismaMock.company.findUnique.mockResolvedValue(null);
      (companyOtpService.createCompany as jest.Mock).mockResolvedValue(true);
      (sendOtpToPhone as jest.Mock).mockResolvedValue(true);

      const result = await companyService.createCompanyService({
        name: 'Valid Co',
        phone: '1234567890',
        userId: 'user-1',
        website: '',
        description: '',
        logo: '',
      });

      expect(result.success).toBe(true);
      expect(sendOtpToPhone).toHaveBeenCalledWith('1234567890', expect.any(String));
    });
  });

  describe('verifyCompanyOtp', () => {
    it('should throw if OTP session is not found', async () => {
      (companyOtpService.otpVerify as jest.Mock).mockResolvedValue(true);
      (redis.get as jest.Mock).mockResolvedValue(null);

      await expect(
        companyService.verifyCompanyOtp({ phone: '1234567890', otp: '1234' })
      ).rejects.toThrow('Invalid or expired company session');
    });

    it('should create a company successfully', async () => {
      const draft = {
        userId: 'user-1',
        name: 'Valid Co',
        website: '',
        description: '',
        logo: '',
      };

      (companyOtpService.otpVerify as jest.Mock).mockResolvedValue(true);
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(draft));
      prismaMock.company.create.mockResolvedValue({ id: 'company-1', ...draft });
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await companyService.verifyCompanyOtp({ phone: '1234567890', otp: '1234' });

      expect(result.success).toBe(true);
      expect(result.company).toBeDefined();
      expect(redis.del).toHaveBeenCalledWith('company_draft:1234567890');
    });
  });
});
