import os
import sys
import ctypes
import eel
import psutil
import tkinter as tk
import pymysql
import logging
import urllib.parse
import pandas as pd

# --- Configurações globais do banco de dados ---
MYSQL_HOST = '10.51.109.123'
MYSQL_USER = 'root'
MYSQL_PASSWORD = urllib.parse.unquote_plus('SB28@sabesp')
MYSQL_DATABASE = 'cjl3'

@eel.expose
def verificarColunaPrimaria():
    query = '''
SELECT 
    contrato AS Contrato,
    pep AS Pep,
    iea AS Iea,
    término AS Término,
    concluído AS Concluído,
    administrador AS Administrador,
    fornecedor AS Fornecedor,
    referência AS Referência,
    descrição_do_contrato AS "Descrição do contrato",
    observação AS Observação,
    CASE 
        WHEN TRIM(COALESCE(valor_contábil, '')) = '' OR TRIM(valor_contábil) = '-' THEN '00.00'
        ELSE valor_contábil
    END AS "Valor contábil"
FROM tb_contrato_sap
    '''
    conn = None
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        print("Conectado ao banco de dados. Executando a query...")
        df = pd.read_sql(query, conn)
        print("Dados carregados no DataFrame com sucesso.")

        relatorio_final = df.where(pd.notnull(df), None)
        return relatorio_final.to_dict(orient="records")
    except Exception as err:
        return {"erro": str(err)}
    finally:
        if conn:
            conn.close()
            print("Conexão com o banco de dados fechada.")



@eel.expose
def verificarContrato(termo=""):
    query = '''
    SELECT DISTINCT contrato
    FROM tb_contrato_sap
    WHERE contrato IS NOT NULL AND contrato LIKE %s
    '''
    conn = None
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        print("Conectado ao banco de dados. Executando a query...")
        # Passe o parâmetro para o LIKE corretamente:
        df = pd.read_sql(query, conn, params=[f"%{termo}%"])
        print(df)
        return df.to_dict(orient='records')
    except Exception as err:
        return {"erro": str(err)}
    finally:
        if conn:
            conn.close()
            print("Conexão com o banco de dados fechada.")


user32 = None
screen_width = 1200
screen_height = 800
try:
    user32 = ctypes.windll.user32
    screen_width = user32.GetSystemMetrics(0)
    screen_height = user32.GetSystemMetrics(1)
except Exception as e:
    logging.warning(f"Não foi possível obter a resolução da tela, usando valores padrão. Erro: {e}")

eel.init('web') 

try:
    logging.info("--- Iniciando Aplicação Eel ---")
    eel.start('index.html', mode='chrome', size=(screen_width, screen_height), port=8001)
    logging.info("Chamada eel.start retornou.")
except EnvironmentError as e:
    logging.error(f"Erro de ambiente ao iniciar EEL: {e}")
    logging.exception("Detalhes do erro de ambiente ao iniciar EEL:")
    os._exit(1)
except Exception as e:
    logging.error(f"Erro geral ao iniciar EEL: {e}")
    logging.exception("Detalhes do erro geral ao iniciar EEL:")
    os._exit(1)

