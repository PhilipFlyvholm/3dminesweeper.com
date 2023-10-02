export async function GET() {
    return new Response(
        `
        <?xml version="1.0" encoding="UTF-8" ?>
        <urlset
            xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="https://www.w3.org/1999/xhtml"
            xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
        >
            <url>
                <loc>https://3dminesweeper.com/</loc>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
            <url>
                <loc>https://3dminesweeper.com/play/3x3x3</loc>
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
            </url>
            <url>
                <loc>https://3dminesweeper.com/play/5x5x5</loc>
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
            </url>
            <url>
                <loc>https://3dminesweeper.com/play/10x10x10</loc>
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
            </url>
            <url>
                <loc>https://3dminesweeper.com/blog/which-is-better-3d-minesweeper-vs-classic</loc>
                <changefreq>weekly</changefreq>
                <priority>0.5</priority>
            </url>
        </urlset>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}
