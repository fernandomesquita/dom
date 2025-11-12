/**
 * Middleware Express para proteger rotas /admin/*
 * 
 * Verifica se o usuário está autenticado e tem role MASTER ou ADMINISTRATIVO.
 * Se não, redireciona para /admin/login.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './auth';

/**
 * Middleware para proteger rotas /admin/* (exceto /admin/login)
 */
export function adminGuard(req: Request, res: Response, next: NextFunction) {
  // Permitir acesso à página de login admin
  if (req.path === '/login' || req.path.startsWith('/login/')) {
    return next();
  }

  // Permitir acesso a assets estáticos
  if (req.path.startsWith('/assets/') || req.path.startsWith('/@')) {
    return next();
  }

  // Verificar token de acesso no cookie
  const accessToken = req.cookies?.access_token;
  
  if (!accessToken) {
    // Não autenticado - redirecionar para login admin
    return res.redirect('/admin/login');
  }

  try {
    // Verificar e decodificar token
    const payload = verifyAccessToken(accessToken);
    
    // Verificar se o role é MASTER ou ADMINISTRATIVO
    const allowedRoles = ['MASTER', 'ADMINISTRATIVO'];
    if (!payload.role || !allowedRoles.includes(payload.role)) {
      // Role inválido - redirecionar para login admin
      return res.redirect('/admin/login');
    }

    // Usuário autorizado - permitir acesso
    return next();
  } catch (error) {
    // Token inválido ou expirado - redirecionar para login admin
    return res.redirect('/admin/login');
  }
}
