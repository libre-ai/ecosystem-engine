#![forbid(unsafe_code)]

/// Version of the first canonical Libre AI Knowledge Object schema.
pub const KNOWLEDGE_OBJECT_SCHEMA_VERSION: &str = "libre-ai.knowledge-object.v1";

/// Returns whether an identifier belongs to the canonical Libre AI URN namespace.
#[must_use]
pub fn is_canonical_id(value: &str) -> bool {
    let mut segments = value.split(':');
    matches!(
        (
            segments.next(),
            segments.next(),
            segments.next(),
            segments.next(),
            segments.next(),
        ),
        (Some("urn"), Some("libre-ai"), Some(kind), Some(name), None)
            if !kind.is_empty() && !name.is_empty()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_a_canonical_identifier() {
        assert!(is_canonical_id("urn:libre-ai:bet:bun-fullstack"));
    }

    #[test]
    fn rejects_an_identifier_with_an_unbounded_suffix() {
        assert!(!is_canonical_id("urn:libre-ai:bet:bun:fullstack"));
    }
}
