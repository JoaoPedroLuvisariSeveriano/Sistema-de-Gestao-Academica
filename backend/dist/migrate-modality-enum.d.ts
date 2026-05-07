/**
 * Script de Migração para corrigir o enum courses_modality_enum
 *
 * Problema: O banco tem valores antigos (presencial, ead, hibrido) em minúsculo
 * mas o código espera (Presencial, EAD, Híbrido) com iniciais maiúsculas
 *
 * Solução: Adicionar novos valores ao enum, converter registros, e remover antigos
 */
import 'reflect-metadata';
//# sourceMappingURL=migrate-modality-enum.d.ts.map