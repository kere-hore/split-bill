import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberName = searchParams.get('memberName') || 'Member';
    const groupName = searchParams.get('groupName') || 'Group';
    const merchantName = searchParams.get('merchantName') || 'Restaurant';
    const totalAmount = searchParams.get('totalAmount') || '0';
    const itemCount = searchParams.get('itemCount') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '60px',
              margin: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '90%',
              maxWidth: '1000px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
              }}
            >
              🧾 Your Bill Share
            </div>

            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              {memberName}
            </div>

            <div
              style={{
                fontSize: '20px',
                color: '#6b7280',
                marginBottom: '32px',
                textAlign: 'center',
              }}
            >
              from {groupName}
            </div>

            <div
              style={{
                fontSize: '24px',
                color: '#6b7280',
                marginBottom: '40px',
                textAlign: 'center',
              }}
            >
              {merchantName}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
                gap: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#fef3c7',
                  borderRadius: '16px',
                  padding: '24px',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#d97706',
                    marginBottom: '8px',
                  }}
                >
                  Rp {totalAmount}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#92400e',
                  }}
                >
                  Your Share
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#dbeafe',
                  borderRadius: '16px',
                  padding: '24px',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '8px',
                  }}
                >
                  {itemCount}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#1d4ed8',
                  }}
                >
                  Items
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}