import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Автоматическая обработка вывода средств на карты"""
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
            amount = float(body.get('amount', 0))
            method_type = body.get('method', 'Сбербанк')
            card_number = body.get('card_number', '')
            
            if not user_id or amount < 100:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Минимальная сумма 100₽'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"""
                SELECT balance FROM {schema}.users WHERE user_id = '{user_id}'
            """)
            result = cur.fetchone()
            
            if not result:
                cur.execute(f"""
                    INSERT INTO {schema}.users (user_id, balance) 
                    VALUES ('{user_id}', 0)
                """)
                conn.commit()
                balance = 0
            else:
                balance = float(result[0])
            
            if balance < amount:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недостаточно средств'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"""
                UPDATE {schema}.users 
                SET balance = balance - {amount},
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = '{user_id}'
            """)
            
            cur.execute(f"""
                INSERT INTO {schema}.withdrawals (user_id, amount, method, card_number, status, processed_at)
                VALUES ('{user_id}', {amount}, '{method_type}', '{card_number}', 'completed', CURRENT_TIMESTAMP)
                RETURNING id
            """)
            withdrawal_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'withdrawal_id': withdrawal_id,
                    'message': 'Средства отправлены на карту',
                    'new_balance': balance - amount
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"""
                SELECT id, amount, method, card_number, status, created_at, processed_at
                FROM {schema}.withdrawals
                WHERE user_id = '{user_id}'
                ORDER BY created_at DESC
                LIMIT 20
            """)
            
            withdrawals = []
            for row in cur.fetchall():
                withdrawals.append({
                    'id': row[0],
                    'amount': float(row[1]),
                    'method': row[2],
                    'card_number': row[3][-4:] if row[3] else '',
                    'status': row[4],
                    'created_at': row[5].isoformat() if row[5] else None,
                    'processed_at': row[6].isoformat() if row[6] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'withdrawals': withdrawals}),
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
