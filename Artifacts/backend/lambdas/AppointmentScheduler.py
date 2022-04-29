import json
import dateutil.parser
import time
import os
import math
import random
import logging
import re
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb', region_name=os.environ['AWS_REGION'])
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

""" --- Helpers to build responses which match the structure of the
necessary dialog actions --- """

def delegate(session_attributes, slots):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }

""" --- Helper Functions --- """
def parse_int(n):
    try:
        return int(n)
    except ValueError:
        return float('nan')

def try_ex(func):
    """
    Call passed in function in try block. If KeyError is encountered return None.
    This function is intended to be used to safely access dictionary.

    Note that this function would have negative impact on performance.
    """

    try:
        return func()
    except KeyError:
        return None

""" --- Functions that control the bot's behavior --- """
def format_num(user_phone):
    pt1=user_phone[0:3]
    pt2=user_phone[3:6]
    pt3=user_phone[6:10]
    return('+1'+'-'+pt1+'-'+pt2+'-'+pt3)

def send_messages(user_phone, text2sms):
    pinpoint = boto3.client('pinpoint', region_name=os.environ['AWS_REGION'])
    tonumber = user_phone
    messages = text2sms
    response = pinpoint.send_messages(
        ApplicationId=os.environ['PINPOINT_ID'],
        MessageRequest={
            'Addresses': {
                tonumber : {'ChannelType': 'SMS'}
            },
            'MessageConfiguration': {
                'SMSMessage': {
                    'Body': messages,
                    'MessageType': 'TRANSACTIONAL',
                    'OriginationNumber': os.environ['TOLL_FREE_NUMBER']
                }
            }
        }
    )
    return response['ResponseMetadata']['HTTPStatusCode']
    
def putItemInDDB(w_date,w_time,w_name, w_location, w_phone):
    table = dynamodb.Table('AppointmentsTable')
    
    put_response = table.put_item(
       Item={
            'date': w_date,
            'timeslot': w_time,
            'fname': w_name,
            'store': w_location,
            'phone': w_phone,
            'meeting': 'Scheduled',
            'notes': ''
        }
    )
    return (put_response ["ResponseMetadata"]["HTTPStatusCode"])
    
def close(session_attributes, fulfillment_state, message, user_phone, text2sms):
    send_messages(user_phone, text2sms)
    response = {
        'sessionState' : {
            'sessionAttributes': session_attributes,
            'dialogAction': {
                'type': 'Close',
                'fulfillmentState': fulfillment_state
            },
            'intent' : {
                'confirmationState': 'Confirmed',
                'name': 'MakeAppointment',
                'state': 'Fulfilled'
            }
        },
        'messages': [message]
    }
    print ("mynewresponse",response)
    return response

def make_appointment(intent_request):             
    appointment_type = intent_request['intent']['slots']['AppointmentType']['value']['interpretedValue']
    date = intent_request['intent']['slots']['Date']['value']['interpretedValue']
    appointment_time = intent_request['intent']['slots']['Time']['value']['interpretedValue']
    user_name = intent_request['intent']['slots']['Name']['value']['interpretedValue']
    user_phone = intent_request['intent']['slots']['Phone']['value']['interpretedValue']
    # remove all non numeric characters and add + sign
    user_phone = '+' + re.sub('[^0-9]', '', user_phone)
    output_session_attributes = intent_request['sessionAttributes'] if 'sessionAttributes' in intent_request else {}
    text2sms = 'Appointment Notification: Hey {} appointment is confirmed for {}. See you there!'.format(user_name, appointment_time)
    putItemInDDB(date,appointment_time,user_name, 'Store Location', user_phone)
    return close(
        output_session_attributes,
        'Fulfilled',
        {
            'contentType': 'PlainText',
            'content': 'Thanks {}, your appointment is confirmed for {}, and we have texted the details to your number.'.format(user_name, appointment_time)
        },
        user_phone,
        text2sms
    )

""" --- Intents --- """
def dispatch(intent_request):
    """
    Called when the user specifies an intent for this bot.
    """

    logger.debug('dispatch userId={}, intentName={}'.format(intent_request['bot']['id'], intent_request['sessionState']['intent']['name']))

    intent_name = intent_request['sessionState']['intent']['name']

    # Dispatch to your bot's intent handlers
    if intent_name == 'MakeAppointment':
        return make_appointment(intent_request['sessionState'])
    raise Exception('Intent with name ' + intent_name + ' not supported')

""" --- Main handler --- """
def lambda_handler(event, context):
    # By default, treat the user request as coming from the America/New_York time zone.
    os.environ['TZ'] = 'America/New_York'
    print('myevent',event)
    time.tzset()
    print(time.tzset())
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    return dispatch(event)
