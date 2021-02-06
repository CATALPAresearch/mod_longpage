export const filterAnnotationsByTargetType = (annotations, targetType) => {
    return annotations.filter(
        annotation => annotation.target.some(target => target.type === targetType)
    );
};

export const getAnnotationCardId = annotationId => `annotation-${annotationId}`;
