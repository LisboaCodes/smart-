'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Star, ThumbsUp, Loader2 } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  verified: boolean
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function ProductReviews({
  productId,
  reviews: initialReviews,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    name: '',
    email: '',
  })

  const handleSubmitReview = async () => {
    if (!newReview.comment || !newReview.name || !newReview.email) {
      toast({
        title: 'Preencha todos os campos',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          ...newReview,
        }),
      })

      if (response.ok) {
        const review = await response.json()
        setReviews([review, ...reviews])
        setNewReview({ rating: 5, comment: '', name: '', email: '' })
        setShowForm(false)
        toast({ title: 'Avaliacao enviada com sucesso!' })
      } else {
        throw new Error('Failed to submit review')
      }
    } catch (error) {
      toast({
        title: 'Erro ao enviar avaliacao',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/avaliacoes/${reviewId}/helpful`, { method: 'POST' })
      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      ))
    } catch (error) {
      // Silent fail
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: star })) : undefined}
          />
        ))}
      </div>
    )
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliacoes dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="mt-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? 'avaliacao' : 'avaliacoes'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="mt-6" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Escrever Avaliacao'}
          </Button>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Sua Avaliacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sua nota</label>
              <div className="mt-1">{renderStars(newReview.rating, true)}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Seu nome</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Nome"
                  value={newReview.name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Seu e-mail</label>
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="email@exemplo.com"
                  value={newReview.email}
                  onChange={(e) => setNewReview(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Seu comentario</label>
              <Textarea
                className="mt-1"
                placeholder="Conte sua experiencia com o produto..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Avaliacao'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma avaliacao ainda. Seja o primeiro a avaliar!
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.customerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.customerName}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating, false, 'sm')}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleHelpful(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Util ({review.helpful})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
