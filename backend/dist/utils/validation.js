"use strict";
/**
 * Utilitários de validação para o Sistema de Gestão Acadêmica
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCPF = validateCPF;
exports.validateEmail = validateEmail;
exports.validatePhone = validatePhone;
exports.validateBirthDate = validateBirthDate;
exports.validateGrade = validateGrade;
exports.validateAttendance = validateAttendance;
exports.formatCPF = formatCPF;
exports.formatPhone = formatPhone;
exports.cleanCPF = cleanCPF;
// Valida CPF brasileiro
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    // CPF deve ter 11 dígitos
    if (cleanCPF.length !== 11) {
        return false;
    }
    // Verifica se todos os dígitos são iguais (CPFs inválidos como 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) {
        digit = 0;
    }
    if (digit !== parseInt(cleanCPF[9])) {
        return false;
    }
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) {
        digit = 0;
    }
    if (digit !== parseInt(cleanCPF[10])) {
        return false;
    }
    return true;
}
// Valida email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Valida telefone brasileiro
function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}
// Valida data de nascimento (não pode ser no futuro)
function validateBirthDate(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    return birth < today;
}
// Valida nota (0 a 10)
function validateGrade(grade) {
    return grade >= 0 && grade <= 10;
}
// Valida percentual de frequência (0 a 100)
function validateAttendance(attendance) {
    return attendance >= 0 && attendance <= 100;
}
// Formata CPF
function formatCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
// Formata telefone
function formatPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
}
// Remove formatação de CPF
function cleanCPF(cpf) {
    return cpf.replace(/\D/g, '');
}
//# sourceMappingURL=validation.js.map