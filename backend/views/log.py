import logging
import csv
from io import StringIO

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from django.http import HttpResponse

from backend.models import Log
from backend.serializers.log import LogSerializer
from backend.serializers.params import LogQueryParamsSerializer
from backend.services.log import LogService

logger = logging.getLogger(__name__)


class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer
    filterset_fields = "__all__"

    @staticmethod
    def get_filters(validated_data):
        return {
            'start_date': validated_data.get(
                'start_date').isoformat() if validated_data.get('start_date') else None,
            'end_date': validated_data.get(
                'end_date').isoformat() if validated_data.get('end_date') else None,
            'severity': validated_data.get('severity'),
            'source': validated_data.get('source'),
        }

    @action(detail=False, methods=["get"])
    def query(self, request):
        try:
            query_serializer = LogQueryParamsSerializer(data=request.query_params)
            query_serializer.is_valid(raise_exception=True)
            validated_data = query_serializer.validated_data

            errors, filtered_logs = LogService.filter_logs(
                self.queryset,
                validated_data,
            )

            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            page = self.paginate_queryset(filtered_logs)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(filtered_logs, many=True)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error in log query: {str(e)}", exc_info=True)
            return Response(
                {'non_field_errors': ['An unexpected error occurred']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["get"])
    def aggregate(self, request):
        try:
            query_serializer = LogQueryParamsSerializer(data=request.query_params)
            query_serializer.is_valid(raise_exception=True)
            validated_data = query_serializer.validated_data

            errors, filtered_logs = LogService.filter_logs(
                self.queryset,
                validated_data,
            )

            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            aggregated_logs = LogService.get_aggregate_logs(filtered_logs)
            filters = self.get_filters(validated_data)

            return Response({
                'data': aggregated_logs,
                'filters': filters
            })

        except Exception as e:
            logger.error(f"Error in log aggregation: {str(e)}", exc_info=True)
            return Response({
                'non_field_errors': ['An unexpected error occurred']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def download_csv(self, request):
        try:
            query_serializer = LogQueryParamsSerializer(data=request.query_params)
            query_serializer.is_valid(raise_exception=True)
            validated_data = query_serializer.validated_data

            errors, filtered_logs = LogService.filter_logs(
                self.queryset,
                validated_data,
            )

            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            fields = list(LogSerializer().get_fields().keys())
            csv_buffer = StringIO()
            writer = csv.DictWriter(csv_buffer, fieldnames=fields)
            writer.writeheader()

            for log in filtered_logs:
                writer.writerow({
                    'id': log.id,
                    'timestamp': log.timestamp,
                    'message': log.message,
                    'severity': log.severity,
                    'source': log.source,
                })

            csv_content = csv_buffer.getvalue()
            csv_buffer.close()

            response = HttpResponse(
                content=csv_content,
                content_type='text/csv'
            )
            response['Content-Disposition'] = 'attachment; filename="logs.csv"'

            return response

        except Exception as e:
            logger.error("Error generating CSV: %s", str(e), exc_info=True)
            return Response(
                {'non_field_errors': ['An unexpected error occurred while generating the CSV']},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
