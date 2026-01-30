import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Обработка кликов по рекламе с начислением вознаграждения до 10000₽"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            ad_id = body.get('ad_id')
            
            if not user_id or not ad_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id и ad_id обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"""
                SELECT reward, title FROM {schema}.ads 
                WHERE ad_id = '{ad_id}' AND is_active = TRUE
            """)
            ad_result = cur.fetchone()
            
            if not ad_result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Задание не найдено'}),
                    'isBase64Encoded': False
                }
            
            reward = float(ad_result[0])
            ad_title = ad_result[1]
            
            cur.execute(f"""
                SELECT user_id FROM {schema}.users WHERE user_id = '{user_id}'
            """)
            if not cur.fetchone():
                cur.execute(f"""
                    INSERT INTO {schema}.users (user_id, balance, total_earned, total_clicks)
                    VALUES ('{user_id}', 0, 0, 0)
                """)
                conn.commit()
            
            cur.execute(f"""
                INSERT INTO {schema}.clicks (user_id, ad_id, reward)
                VALUES ('{user_id}', '{ad_id}', {reward})
            """)
            
            cur.execute(f"""
                UPDATE {schema}.users
                SET balance = balance + {reward},
                    total_earned = total_earned + {reward},
                    total_clicks = total_clicks + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = '{user_id}'
                RETURNING balance, total_earned, total_clicks
            """)
            
            user_data = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'earned': reward,
                    'ad_title': ad_title,
                    'new_balance': float(user_data[0]),
                    'total_earned': float(user_data[1]),
                    'total_clicks': user_data[2]
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if user_id:
                cur.execute(f"""
                    SELECT balance, total_earned, total_clicks, created_at
                    FROM {schema}.users
                    WHERE user_id = '{user_id}'
                """)
                user_result = cur.fetchone()
                
                if user_result:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'balance': float(user_result[0]),
                            'total_earned': float(user_result[1]),
                            'total_clicks': user_result[2],
                            'member_since': user_result[3].isoformat() if user_result[3] else None
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute(f"""
                SELECT ad_id, title, description, reward, duration_seconds, category, target_url
                FROM {schema}.ads
                WHERE is_active = TRUE
                ORDER BY reward DESC
            """)
            
            ads = []
            for row in cur.fetchall():
                ads.append({
                    'ad_id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'reward': float(row[3]),
                    'duration_seconds': row[4],
                    'category': row[5],
                    'target_url': row[6]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ads': ads}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        if conn:
            cur.close()
            conn.close()
