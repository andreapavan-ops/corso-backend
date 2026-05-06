// routes/auth.js — Endpoints di autenticazione
//
// POST /api/auth/registrazione — crea utente e restituisce JWT
// POST /api/auth/login         — verifica credenziali e restituisce JWT

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";

const router = Router();

// ============================================================
// POST /api/auth/registrazione
// ============================================================

router.post("/registrazione", async (req, res) => {
    try {
        const { nome, email, citta, sesso, codiceFiscale, dataNascita, telefono, password } = req.body;

        if (!nome || !email || !password || !sesso || !codiceFiscale) {
            return res.status(400).json({ errore: "Campi obbligatori: nome, email, password, sesso, codiceFiscale" });
        }
        if (password.length < 8) {
            return res.status(400).json({ errore: "La password deve avere almeno 8 caratteri" });
        }

        // Controlla se l'email è già in uso
        const esistente = await trovaUtentePerEmail(email);
        if (esistente) {
            return res.status(409).json({ errore: "Email già registrata" });
        }

        const hash = await bcrypt.hash(password, 10);
        const utente = await creaUtente({ nome, email, citta, sesso, codiceFiscale, dataNascita, telefono, password: hash });

        // Genera il token JWT — firmato con la chiave segreta, scade in 7 giorni
        const token = jwt.sign(
            { id: utente.id, email, nome, ruolo: utente.ruolo },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token, utente });
    } catch (errore) {
        console.error("Errore POST /api/auth/registrazione:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// POST /api/auth/login
// ============================================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errore: "Email e password sono obbligatori" });
        }

        // Cerca l'utente per email (include la password hash)
        const utente = await trovaUtentePerEmail(email);
        if (!utente) {
            return res.status(401).json({ errore: "Credenziali non valide" });
        }

        // Confronta la password con l'hash salvato
        const passwordCorretta = await bcrypt.compare(password, utente.password);
        if (!passwordCorretta) {
            return res.status(401).json({ errore: "Credenziali non valide" });
        }

        const token = jwt.sign(
            { id: utente.id, email: utente.email, nome: utente.nome, ruolo: utente.ruolo },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Non restituire la password hash nella risposta
        const { password: _, ...utentePublico } = utente;

        res.json({ token, utente: utentePublico });
    } catch (errore) {
        console.error("Errore POST /api/auth/login:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;
