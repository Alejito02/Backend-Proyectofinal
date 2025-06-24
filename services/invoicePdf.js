// services/invoicePdf.js

// Importaciones dinámicas para Puppeteer y Chromium
let puppeteer;
let chromium;

// Determinamos qué módulo importar en tiempo de ejecución
// Esto permite que el paquete 'puppeteer' (completo) maneje la descarga en local
// y '@sparticuz/chromium' en producción (Render)
if (process.env.NODE_ENV === 'production') {
    // En producción (Render), usamos puppeteer-core y @sparticuz/chromium
    // Usamos 'await import()' para que sean cargados solo si es necesario
    const puppeteerCoreModule = await import('puppeteer-core');
    const chromiumModule = await import('@sparticuz/chromium');
    puppeteer = puppeteerCoreModule.default;
    chromium = chromiumModule.default;
} else {
    // En desarrollo local, usamos el paquete completo de puppeteer
    // Este paquete es capaz de autodescargar y encontrar el navegador
    const puppeteerModule = await import('puppeteer');
    puppeteer = puppeteerModule.default;
}


import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';


function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount, currencyCode = 'COP') {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0
    }).format(amount);
}

function getStatusText(state) {
    const statusMap = {
        0: 'Cancelado',
        1: 'Pagado',
        2: 'En proceso',
        3: 'Enviado',
        4: 'Entregado'
    };
    return statusMap[state] || 'Desconocido';
}


export async function generateInvoicePdf(invoiceData){
    let browser;
    try {
        console.log("datos de factura", invoiceData);
        const templatePath = path.join(process.cwd(), 'templates', 'invoice.ejs');
        const templateContent = await fs.readFile(templatePath, 'utf8');

        const htmlContent = ejs.render(templateContent, {
            invoice: invoiceData,
            formatDate: formatDate,
            formatCurrency: formatCurrency,
            getStatusText: getStatusText
        });
        console.log("htmlContent" , htmlContent);

        // Opciones base para Puppeteer
        let launchOptions = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage'
            ],
            headless: 'new' // Puedes dejarlo fijo en 'new' o 'true' para ambos entornos
        };

        // Ajustar opciones si estamos en producción (Render)
        if (process.env.NODE_ENV === 'production') {
            // Usamos las propiedades de @sparticuz/chromium
            launchOptions.args = chromium.args;
            launchOptions.defaultViewport = chromium.defaultViewport;
            launchOptions.headless = chromium.headless;
            launchOptions.executablePath = await chromium.executablePath();
        } else {
            // En desarrollo local, el paquete 'puppeteer' (completo) se encargará de encontrar
            // o descargar el navegador. No necesitamos especificar 'executablePath'.
            // Los 'args' ya están definidos en 'launchOptions' para ambos casos.
        }

        // Lanzar Puppeteer
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        return pdfBuffer;

    } catch (error) {
        console.error('Error en generateInvoicePdf:', error);
        throw new Error(`No se pudo generar el PDF de la factura: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}