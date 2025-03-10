from rest_framework import serializers


class LogQueryParamsSerializer(serializers.Serializer):
    VALID_SEVERITIES = {'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'}

    start_date = serializers.DateField(required=False, input_formats=['%Y-%m-%d'])
    end_date = serializers.DateField(required=False, input_formats=['%Y-%m-%d'])
    severity = serializers.CharField(required=False, allow_blank=True)
    source = serializers.CharField(required=False, allow_blank=True)

    def validate_severity(self, value):
        if not value:
            return value

        if not value.isupper():
            raise serializers.ValidationError("Severity should be in uppercase!")

        if value not in self.VALID_SEVERITIES:
            raise serializers.ValidationError(
                f"Invalid severity! Valid values are: {', '.join(self.VALID_SEVERITIES)}"
            )

        return value

    def validate_source(self, value):
        if not value:
            return value

        if not value.islower():
            raise serializers.ValidationError("Source should be in lowercase!")

        return value

    def validate(self, data):
        errors = {}

        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date and start_date > end_date:
            errors['end_date'] = ['End date cannot be earlier than start date!']

        if errors:
            raise serializers.ValidationError(errors)

        return data
