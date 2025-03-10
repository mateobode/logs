from django.db.models import Q, Count


class LogService:
    @staticmethod
    def filter_logs(queryset, validated_data):
        filters = Q()

        start_date = validated_data.get('start_date')
        end_date = validated_data.get('end_date')

        if start_date and end_date and start_date == end_date:
            filters &= Q(timestamp__date=start_date)
        else:
            if start_date:
                filters &= Q(timestamp__gte=start_date)
            if end_date:
                filters &= Q(timestamp__lte=end_date)

        if validated_data.get('severity'):
            filters &= Q(severity=validated_data['severity'])

        if validated_data.get('source'):
            filters &= Q(source=validated_data['source'])

        filtered_logs = queryset.filter(filters)
        if not filtered_logs.exists():
            return {'non_field_errors': ['No logs found with the specified criteria']}, None

        return {}, filtered_logs

    @staticmethod
    def get_aggregate_logs(queryset):
        return {
            'total_logs': queryset.count(),
            'by_severity': queryset.values('severity').annotate(count=Count('id')),
            'by_source': queryset.values('source').annotate(count=Count('id')),
            'by_date': queryset.values('timestamp__date').annotate(count=Count('id')).order_by('-timestamp__date')
        }