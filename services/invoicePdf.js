import puppeteer from 'puppeteer';
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
        

        // Lanzar Puppeteer
        browser = await puppeteer.launch({
            headless: 'new', 
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage' 
            ]
        });
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
            await browser.close(); // Siempre cierra el navegador para liberar recursos
        }
    }
}