const WhatsAppButton = () => {
    const phone = '916376263462'; // India code + number
    const message = encodeURIComponent('Hello! I am interested in your perfumes from Lakshaura.');
    const url = `https://wa.me/${phone}?text=${message}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with us on WhatsApp"
            style={{
                position: 'fixed',
                bottom: '28px',
                right: '28px',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: '#25D366',
                boxShadow: '0 4px 20px rgba(37, 211, 102, 0.5)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                textDecoration: 'none',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.12)';
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(37, 211, 102, 0.7)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.5)';
            }}
        >
            {/* Pulse ring */}
            <span style={{
                position: 'absolute',
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.4)',
                animation: 'whatsapp-pulse 2s infinite',
            }} />

            {/* WhatsApp SVG icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="30"
                height="30"
                fill="white"
                style={{ position: 'relative', zIndex: 1 }}
            >
                <path d="M24 4C12.95 4 4 12.95 4 24c0 3.55.93 6.87 2.56 9.75L4 44l10.55-2.52A19.86 19.86 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm0 36a16 16 0 01-8.18-2.26l-.58-.35-6.27 1.5 1.53-6.1-.38-.62A15.93 15.93 0 018 24c0-8.84 7.16-16 16-16s16 7.16 16 16-7.16 16-16 16zm8.72-11.72c-.48-.24-2.83-1.4-3.27-1.56-.44-.16-.76-.24-1.08.24-.32.48-1.24 1.56-1.52 1.88-.28.32-.56.36-1.04.12-.48-.24-2.02-.75-3.85-2.38-1.42-1.27-2.38-2.84-2.66-3.32-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.08-2.6-1.48-3.56-.39-.93-.78-.8-1.08-.82-.28-.01-.6-.01-.92-.01s-.84.12-1.28.6c-.44.48-1.68 1.64-1.68 4s1.72 4.64 1.96 4.96c.24.32 3.38 5.16 8.2 7.24 1.15.5 2.04.8 2.74 1.02 1.15.36 2.2.31 3.03.19.92-.14 2.83-1.16 3.23-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56z" />
            </svg>

            <style>{`
                @keyframes whatsapp-pulse {
                    0%   { transform: scale(1);   opacity: 0.7; }
                    70%  { transform: scale(1.6); opacity: 0; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
            `}</style>
        </a>
    );
};

export default WhatsAppButton;
