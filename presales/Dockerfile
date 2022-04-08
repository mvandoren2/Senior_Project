FROM python:3
ENV PYTHONNUNBUFFERED=1

WORKDIR /usr/src/app

RUN pip install --upgrade pip
COPY config/requirements.txt ./
RUN pip install -r requirements.txt

COPY . /usr/src/app